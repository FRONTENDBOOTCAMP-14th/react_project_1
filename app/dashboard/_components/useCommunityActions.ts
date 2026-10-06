'use client'

import { leaveCommunityAction } from '@/app/actions/dashboard'
import { MESSAGES } from '@/constants'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useCommunityActions() {
  const router = useRouter()

  const handleLeaveCommunity = useCallback(
    async (clubId: string) => {
      try {
        const result = await leaveCommunityAction(clubId)

        if (result.success) {
          toast.success(MESSAGES.SUCCESS.COMMUNITY_LEAVE)
          router.refresh()
        } else {
          toast.error(result.error || MESSAGES.ERROR.COMMUNITY_LEAVE_FAILED)
        }
      } catch (error) {
        console.error('Error leaving community:', error)
        toast.error(MESSAGES.ERROR.COMMUNITY_LEAVE_ERROR)
      }
    },
    [router]
  )

  const confirmLeaveCommunity = useCallback(
    (clubId: string, communityName: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const confirmed = confirm(MESSAGES.ACTION.CONFIRM_LEAVE(communityName))

        if (confirmed) {
          handleLeaveCommunity(clubId)
            .then(() => resolve())
            .catch(reject)
        } else {
          reject(new Error(MESSAGES.ERROR.USER_CANCELLED))
        }
      })
    },
    [handleLeaveCommunity]
  )

  return {
    leaveCommunity: handleLeaveCommunity,
    confirmLeaveCommunity,
  }
}
