'use client'

import { ErrorState } from '@/components/common'
import { MESSAGES } from '@/constants'

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
  return <ErrorState message={MESSAGES.ERROR.PAGE_LOAD_FAILED} onRetry={reset} />
}
