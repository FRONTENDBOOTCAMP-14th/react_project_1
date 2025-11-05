import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import type { Metadata } from 'next'
import { ProfileContent } from './_components'

export const metadata: Metadata = {
  title: '프로필 | 토끼노트',
  description: '내 프로필 정보를 관리하고 수정하세요.',
  openGraph: {
    title: '프로필 | 토끼노트',
    description: '내 프로필 정보를 관리하고 수정하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: false, // 개인 프로필은 검색 엔진에 노출하지 않음
    follow: false,
  },
}

export default async function ProfilePage() {
  // Middleware에서 인증 확인 - 중복 체크 불필요
  const userId = await getCurrentUserId()

  const user = await prisma.user.findUnique({ where: { userId: userId || '' } })
  // Middleware에서 이미 유효한 사용자만 통과하므로 간단한 체크만
  if (user && !user.deletedAt) {
    return <ProfileContent user={user} />
  }
}
