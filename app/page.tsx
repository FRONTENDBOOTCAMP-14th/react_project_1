import { IconLink } from '@/components/ui'
import { ErrorBoundary } from '@/components/common'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import Image from 'next/image'
import { Suspense } from 'react'
import { HomeContent } from './_components'
import RecommendedStudies from './_components/RecommendedStudies'
import styles from './page.module.css'

// 로딩 컴포넌트
function RecommendedStudiesLoading() {
  return (
    <div className={styles['footer-container']}>
      <h2>추천 스터디</h2>
      <div className={styles['recommend-container']}>
        <div className={styles['recommend-item']}>로딩 중...</div>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const userId = await getCurrentUserId()
  let user = null

  if (userId) {
    user = await prisma.user.findUnique({ where: { userId } })
    // 삭제된 사용자는 null로 처리
    if (user?.deletedAt) {
      user = null
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles['logo-container']}>
        <IconLink className={styles['logo-link']} href="/">
          <Image src="/svg/logo.svg" alt="토끼노트 로고" width={40} height={40} priority />
        </IconLink>
      </div>

      <p className={styles['welcome-message']}>
        {user?.username
          ? `${user?.username}님, 오늘은 어떤 스터디가 기다리고 있을까요?`
          : '스터디를 이용하시려면 로그인이 필요합니다'}
      </p>

      <HomeContent userId={userId}>
        <ErrorBoundary fallback={<div>추천 스터디를 불러올 수 없습니다.</div>}>
          <Suspense fallback={<RecommendedStudiesLoading />}>
            <RecommendedStudies />
          </Suspense>
        </ErrorBoundary>
      </HomeContent>
    </main>
  )
}
