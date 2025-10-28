import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import styles from './page.module.css'
import { StudyCardListItem } from './_components'

export default async function DashboardPage() {
  const userId = await getCurrentUserId()
  if (!userId) {
    redirect('/login')
  }
  const user = await prisma.user.findUnique({ where: { userId } })

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
            {subscribedCommunities.map(community => (
              <StudyCardListItem
                key={community.clubId}
                clubId={community.clubId}
                userId={userId}
                name={community.name}
                description={community.description || ''}
                region={community.region || ''}
                subRegion={community.subRegion || ''}
              />
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
