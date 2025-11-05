'use client'

import { ErrorState } from '@/components/common'

export default function ProfileError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorState message="프로필을 불러올 수 없습니다" onRetry={reset} />
}
