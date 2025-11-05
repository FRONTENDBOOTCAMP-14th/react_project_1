import { IconLink } from '@/components/ui'
import { getCurrentUserId } from '@/lib/auth'
import prisma from '@/lib/prisma'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'
import { HomeContent } from './_components'
import RecommendedStudies from './_components/RecommendedStudies'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: '토끼노트 - 스터디 진행 관리/커뮤니티 플랫폼',
  description:
    '스터디 그룹을 만들고 관리하세요. 다양한 커뮤니티에 참여하고 함께 성장하는 즐거움을 경험하세요.',
  openGraph: {
    title: '토끼노트',
    description: '스터디 진행 관리/커뮤니티 플랫폼',
    type: 'website',
    locale: 'ko_KR',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: '토끼노트 로고',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: '토끼노트',
    description: '스터디 진행 관리/커뮤니티 플랫폼',
    images: ['/images/logo.png'],
  },
  keywords: ['스터디', '커뮤니티', '스터디 그룹', '학습', '관리'],
  robots: {
    index: true,
    follow: true,
  },
}

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
        <Suspense fallback={<RecommendedStudiesLoading />}>
          <RecommendedStudies />
        </Suspense>
      </HomeContent>
    </main>
  )
}
