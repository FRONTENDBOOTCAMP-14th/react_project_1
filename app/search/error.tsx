'use client'

import { ErrorState } from '@/components/common'

export default function SearchError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorState message="검색 중 오류가 발생했습니다" onRetry={reset} />
}
