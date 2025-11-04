import { getCurrentUserId } from '@/lib/auth'
import { MESSAGES } from '@/constants'
import prisma from '@/lib/prisma'
import type { CommunityInfo } from '@/lib/types/community'
import { redirect } from 'next/navigation'
import { StudyCardList } from './_components'

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
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <StudyCardList
      communities={subscribedCommunities as CommunityInfo[]}
      username={user?.username || MESSAGES.DASHBOARD.DEFAULT_USERNAME}
    />
  )
}
