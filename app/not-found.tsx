'use client'

import { StrokeButton, StrokeLink } from '@/components/ui'
import { useRouter } from 'next/navigation'
import styles from './not-found.module.css'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className={styles['not-found']}>
      <h1>페이지를 찾을 수 없습니다.</h1>
      <p>요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
      <div className={styles['button-container']}>
        <StrokeLink href="/">홈으로 돌아가기</StrokeLink>
        <StrokeButton type="button" onClick={() => router.back()}>
          이전 페이지로 돌아가기
        </StrokeButton>
      </div>
    </div>
  )
}
