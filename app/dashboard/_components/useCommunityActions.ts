'use client'

import { leaveCommunityAction } from '@/app/actions/dashboard'
import { useCallback } from 'react'
import { toast } from 'sonner'

export function useCommunityActions() {
  const handleLeaveCommunity = useCallback(async (clubId: string) => {
    try {
      const result = await leaveCommunityAction(clubId)

      if (result.success) {
        toast.success('커뮤니티를 탈퇴했습니다')
        // Next.js 방식으로 페이지 새로고침
        const { revalidatePath } = await import('next/cache')
        revalidatePath('/dashboard')
      } else {
        toast.error(result.error || '커뮤니티 탈퇴에 실패했습니다')
      }
    } catch (error) {
      console.error('Error leaving community:', error)
      toast.error('커뮤니티 탈퇴 중 오류가 발생했습니다')
    }
  }, [])

  const confirmLeaveCommunity = useCallback(
    (clubId: string, communityName: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const confirmed = confirm(
          `정말로 "${communityName}" 커뮤니티를 탈퇴하시겠습니까?\n탈퇴된 커뮤니티는 복구할 수 없습니다.`
        )

        if (confirmed) {
          handleLeaveCommunity(clubId)
            .then(() => resolve())
            .catch(reject)
        } else {
          reject(new Error('사용자가 취소했습니다'))
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
