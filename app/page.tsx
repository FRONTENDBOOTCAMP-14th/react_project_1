import Image from 'next/image'
import styles from './page.module.css'
import { IconLink } from '@/components/ui'
import { HomeContent } from './_components'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import type { CommunityInfo, CustomSession } from '@/lib/types'
import prisma from '@/lib/prisma'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const userId = (session as CustomSession)?.userId
  const user = await prisma.user.findUnique({ where: { userId } })

  const filteredCommunities: CommunityInfo[] = userId
    ? await (async () => {
        try {
          const response = await fetch(
            `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/communities?userId=${userId}`,
            { cache: 'no-store' }
          )

          if (response.ok) {
            const result = await response.json()
            return (result.data || []) as CommunityInfo[]
          }
        } catch (error) {
          console.error('Failed to fetch communities:', error)
        }

        return []
      })()
    : []

  console.log(filteredCommunities)

  return (
    <main className={styles.main}>
      <div className={styles['logo-container']}>
        <IconLink className={styles['logo-link']} href="/">
          <Image
            src="/svg/logo.svg"
            alt="Study Club Tracker 로고"
            width={40}
            height={40}
            priority
          />
        </IconLink>
      </div>

      {userId ? (
        <div>{user?.username}님, 환영합니다!</div>
      ) : (
        <div>커뮤니티를 이용하시려면 로그인이 필요합니다</div>
      )}

      <HomeContent userId={userId} filteredCommunities={filteredCommunities} />
    </main>
  )
}
