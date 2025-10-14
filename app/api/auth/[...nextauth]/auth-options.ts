import type { NextAuthOptions } from 'next-auth'
import KakaoProvider from 'next-auth/providers/kakao'
import prisma from '@/lib/prisma'

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
        const providerId = String((profile as any)?.id ?? account.providerAccountId)
        const email = (profile as any)?.kakao_account?.email ?? user?.email ?? null
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
        const providerId = String((profile as any)?.id ?? account.providerAccountId)
        const existing = await prisma.user.findFirst({
          where: { provider: 'kakao', providerId, deletedAt: null },
        })
        if (existing) {
          ;(token as any).userId = existing.userId
          ;(token as any).username = existing.username
          ;(token as any).nickname = existing.nickname
        }
      }
      return token
    },
    async session({ session, token }) {
      if ((token as any)?.userId) {
        ;(session as any).userId = (token as any).userId
        if (session.user) {
          session.user.name = ((token as any).nickname as string | undefined) ?? session.user.name
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
