'use client'

import { ErrorState } from '@/components/common'

export default function CommunityError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorState message="커뮤니티 정보를 불러오는 중 오류가 발생했습니다" onRetry={reset} />
}
