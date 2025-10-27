import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { IconLink } from '@/components/ui'
import prisma from '@/lib/prisma'
import type { CustomSession } from '@/lib/types'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { HomeContent } from './_components'
import styles from './page.module.css'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const userId = (session as CustomSession)?.userId
  const user = userId ? await prisma.user.findUnique({ where: { userId } }) : null

  return (
    <main className={styles.main}>
      <div className={styles['logo-container']}>
        <IconLink className={styles['logo-link']} href="/">
          <Image src="/svg/logo.svg" alt="토끼노트 로고" width={40} height={40} priority />
        </IconLink>
      </div>

      {userId ? (
        <div className={styles['welcome-message']}>
          {user?.username}님, 오늘은 어떤 스터디가 기다리고 있을까요?
        </div>
      ) : (
        <div>커뮤니티를 이용하시려면 로그인이 필요합니다</div>
      )}

      <HomeContent userId={userId} />
    </main>
  )
}
