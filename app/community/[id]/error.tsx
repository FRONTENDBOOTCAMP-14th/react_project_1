'use client'

import { ErrorState } from '@/components/common'
import { MESSAGES } from '@/constants'

export default function CommunityError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorState message={MESSAGES.ERROR.COMMUNITY_LOAD_ERROR} onRetry={reset} />
}
