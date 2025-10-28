import type { NextAuthOptions } from 'next-auth'
import KakaoProvider from 'next-auth/providers/kakao'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import type { KakaoProfile, ExtendedToken, CustomSession } from '@/lib/types'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || '',
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    }),
    // 회원가입 완료 후 즉시 로그인을 위한 내부 Provider
    CredentialsProvider({
      id: 'register-complete',
      name: 'Register Complete',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.userId) return null

        // 회원가입 직후에만 사용되므로 userId로 사용자 조회
        const user = await prisma.user.findUnique({
          where: { userId: credentials.userId, deletedAt: null },
        })

        if (!user) return null

        // NextAuth User 객체 반환
        return {
          id: user.userId,
          email: user.email,
          name: user.nickname ?? user.username,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Credentials Provider (회원가입 완료 후 로그인)
      if (account?.provider === 'register-complete') {
        return true
      }

      // Kakao OAuth Provider
      if (account?.provider === 'kakao') {
        const providerId = String((profile as KakaoProfile)?.id ?? account.providerAccountId)
        const email = (profile as KakaoProfile)?.kakao_account?.email ?? user?.email ?? null
        const existing = await prisma.user.findFirst({
          where: { provider: 'kakao', providerId, deletedAt: null },
        })
        if (existing) return true

        // 미가입 사용자 → 회원가입 페이지로 리다이렉트
        const redirectUrl = new URL(
          process.env.REGISTER_PAGE_URL || '/login',
          process.env.NEXTAUTH_URL || 'http://localhost:3000'
        )
        redirectUrl.searchParams.set('step', 'register')
        redirectUrl.searchParams.set('provider', 'kakao')
        redirectUrl.searchParams.set('providerId', providerId)
        if (email) redirectUrl.searchParams.set('email', email)

        return redirectUrl.toString()
      }

      return true
    },
    async jwt({ token, account, profile, user }) {
      // Credentials Provider (회원가입 완료 후 로그인)
      if (account?.provider === 'register-complete' && user) {
        const dbUser = await prisma.user.findUnique({
          where: { userId: user.id, deletedAt: null },
        })
        if (dbUser) {
          ;(token as ExtendedToken).userId = dbUser.userId
          ;(token as ExtendedToken).username = dbUser.username
          ;(token as ExtendedToken).nickname = dbUser.nickname
        }
      }

      // Kakao OAuth Provider
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
