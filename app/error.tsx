'use client'

import { ErrorState } from '@/components/common'

/**
 * 루트 페이지 에러 처리 컴포넌트
 * - layout.tsx는 영향받지 않음 (Header 등 유지)
 */
export default function RootError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorState message="페이지를 불러올 수 없습니다" onRetry={reset} />
}
