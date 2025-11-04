import { getCurrentUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'
import type { CommunityInfo } from '@/lib/types/community'
import { redirect } from 'next/navigation'
import { StudyCardListItem } from './_components'
import styles from './page.module.css'

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
    <main className={styles.container}>
      <h2 className={styles.title}>{user?.username}님의 스터디 목록</h2>
      {subscribedCommunities.length === 0 ? (
        <p>구독한 커뮤니티가 없습니다.</p>
      ) : (
        <div>
          <ul className={styles.list}>
            {subscribedCommunities.map((community: CommunityInfo) => {
              const currentMember = community.communityMembers?.[0]
              const isAdmin = currentMember?.role === 'admin'

              return (
                <StudyCardListItem
                  key={community.clubId}
                  clubId={community.clubId}
                  userId={userId}
                  name={community.name}
                  description={community.description || ''}
                  region={community.region || ''}
                  subRegion={community.subRegion || ''}
                  imageUrl={community.imageUrl || ''}
                  isAdmin={isAdmin}
                />
              )
            })}
          </ul>
        </div>
      )}
    </main>
  )
}
