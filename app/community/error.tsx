'use client'

import { StrokeButton } from '@/components/ui'
import styles from './community.module.css'

export default function CommunitiesError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={styles.error}>
      <h2>커뮤니티를 불러올 수 없습니다</h2>
      <p>일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
      <StrokeButton onClick={() => reset()}>다시 시도</StrokeButton>
    </div>
  )
}
