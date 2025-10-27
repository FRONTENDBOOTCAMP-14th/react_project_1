import prisma from '@/lib/prisma'
import type { CustomSession, ExtendedToken, KakaoProfile } from '@/lib/types'
import type { NextAuthOptions } from 'next-auth'
import KakaoProvider from 'next-auth/providers/kakao'

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

        // 기존 사용자 확인
        const existing = await prisma.user.findFirst({
          where: { provider: 'kakao', providerId, deletedAt: null },
        })

        // 이미 가입된 사용자면 로그인 허용
        if (existing) return true

        // 신규 사용자 자동 회원가입
        try {
          await prisma.user.create({
            data: {
              provider: 'kakao',
              providerId,
              email: email || null,
              username: `kakao_${providerId}`,
              nickname: null, // Kakao profile에서 nickname을 가져올 수 없으므로 null로 설정
            },
          })
          return true
        } catch (error) {
          console.error('Auto signup failed:', error)
          // 자동 가입 실패 시 회원가입 페이지로 리다이렉트
          const redirectBase = '/login?step=register'
          const qs = new URLSearchParams({
            provider: 'kakao',
            providerId,
            email: email ?? '',
          })
          return `${redirectBase}&${qs.toString()}`
        }
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
