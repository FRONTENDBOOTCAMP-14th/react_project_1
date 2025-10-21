import type { NextAuthOptions } from 'next-auth'
import KakaoProvider from 'next-auth/providers/kakao'
import prisma from '@/lib/prisma'
import type { KakaoProfile, ExtendedToken, CustomSession } from '@/lib/types'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || '',
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'kakao') {
        const providerId = String((profile as KakaoProfile)?.id ?? account.providerAccountId)
        const email = (profile as KakaoProfile)?.kakao_account?.email ?? user?.email ?? null
        const existing = await prisma.user.findFirst({
          where: { provider: 'kakao', providerId, deletedAt: null },
        })
        if (existing) return true
        const redirectBase = process.env.REGISTER_PAGE_URL || '/login?step=register'
        const qs = new URLSearchParams({ provider: 'kakao', providerId, email: email ?? '' })
        return `${redirectBase}&${qs.toString()}`
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'kakao') {
        const providerId = String((profile as KakaoProfile)?.id ?? account.providerAccountId)
        const existing = await prisma.user.findFirst({
          where: { provider: 'kakao', providerId, deletedAt: null },
        })
        if (existing) {
          ;(token as ExtendedToken).userId = existing.userId
          ;(token as ExtendedToken).username = existing.username
          ;(token as ExtendedToken).nickname = existing.nickname
        }
      }
      return token
    },
    async session({ session, token }) {
      if ((token as ExtendedToken)?.userId) {
        ;(session as CustomSession).userId = (token as ExtendedToken).userId
        if (session.user) {
          session.user.name = (token as ExtendedToken).nickname ?? session.user.name
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
