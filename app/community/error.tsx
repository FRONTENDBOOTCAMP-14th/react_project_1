'use client'

import { MESSAGES } from '@/constants'
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
      <h2>{MESSAGES.ERROR.COMMUNITY_LOAD_FAILED}</h2>
      <p>{MESSAGES.ERROR.COMMUNITY_TEMPORARY_ERROR}</p>
      <StrokeButton onClick={() => reset()}>{MESSAGES.ACTION.RETRY}</StrokeButton>
    </div>
  )
}
