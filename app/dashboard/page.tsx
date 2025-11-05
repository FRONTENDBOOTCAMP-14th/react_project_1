import { MESSAGES } from '@/constants'
import { getCurrentUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { StudyCardList } from './_components'

export const metadata: Metadata = {
  title: '대시보드 | 토끼노트',
  description: '내가 참여한 스터디 커뮤니티를 관리하고 확인하세요.',
  openGraph: {
    title: '대시보드 | 토끼노트',
    description: '내가 참여한 스터디 커뮤니티를 관리하고 확인하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: false, // 개인 대시보드는 검색 엔진에 노출하지 않음
    follow: false,
  },
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId()
  if (!userId) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({ where: { userId } })

  // 삭제된 사용자는 로그인 페이지로 리다이렉트
  if (!user || user.deletedAt) {
    redirect('/login')
  }

  const subscribedCommunities = await prisma.community.findMany({
    where: {
      deletedAt: null,
      communityMembers: {
        some: {
          userId,
          deletedAt: null,
        },
      },
    },
    select: {
      clubId: true,
      name: true,
      description: true,
      isPublic: true,
      region: true,
      subRegion: true,
      tagname: true,
      createdAt: true,
      imageUrl: true,
      communityMembers: {
        select: {
          role: true,
          userId: true,
        },
        where: {
          userId,
          deletedAt: null,
        },
      },
      rounds: {
        select: {
          roundId: true,
          roundNumber: true,
          startDate: true,
          endDate: true,
          location: true,
        },
        where: {
          deletedAt: null,
          startDate: {
            gte: new Date(),
          },
        },
        orderBy: { roundNumber: 'desc' },
        take: 5, // 최대 5개 라운드만
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50, // 최대 50개 커뮤니티
  })

  return (
    <StudyCardList
      communities={subscribedCommunities}
      username={user?.username || MESSAGES.DASHBOARD.DEFAULT_USERNAME}
    />
  )
}
