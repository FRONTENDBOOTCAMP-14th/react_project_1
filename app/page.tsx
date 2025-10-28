import { IconLink } from '@/components/ui'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import Image from 'next/image'
import { HomeContent } from './_components'
import styles from './page.module.css'

export default async function HomePage() {
  const userId = await getCurrentUserId()
  const user = userId ? await prisma.user.findUnique({ where: { userId } }) : null

  return (
    <main className={styles.main}>
      <div className={styles['logo-container']}>
        <IconLink className={styles['logo-link']} href="/">
          <Image src="/svg/logo.svg" alt="토끼노트 로고" width={40} height={40} priority />
        </IconLink>
      </div>

      <p className={styles['welcome-message']}>
        {userId
          ? `${user?.username}님, 오늘은 어떤 스터디가 기다리고 있을까요?`
          : '스터디를 이용하시려면 로그인이 필요합니다'}
      </p>

      <HomeContent userId={userId} />
    </main>
  )
}
