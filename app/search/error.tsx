'use client'

import { ErrorState } from '@/components/common'
import { MESSAGES } from '@/constants'

export default function SearchError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorState message={MESSAGES.SEARCH.SEARCH_ERROR} onRetry={reset} />
}
