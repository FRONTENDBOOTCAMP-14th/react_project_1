import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
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
  const userId = await getCurrentUserId()
  if (!userId) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({ where: { userId } })

  // 삭제된 사용자는 로그인 페이지로 리다이렉트
  if (!user || user.deletedAt) {
    redirect('/login')
  }

  return <ProfileContent user={user} />
}
