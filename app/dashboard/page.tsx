import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import styles from './page.module.css'
import Link from 'next/link'

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
      <p>{user?.username} 님이 구독한 스터디 목록</p>
      {subscribedCommunities.length === 0 ? (
        <p>구독한 커뮤니티가 없습니다.</p>
      ) : (
        <div>
          <ul>
            {subscribedCommunities.map(community => (
              <li key={community.clubId}>
                <Link href={`/community/${community.clubId}`}>{community.name}</Link>
                <p>{community.description}</p>
                <p>
                  지역: {community.region} {community.subRegion}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
