import type { Notification } from '@/lib/types/notification'

interface UseSmartPinOptions {
  pinnedNotifications: Notification[]
  togglePin: (
    notificationId: string,
    currentPinned: boolean
  ) => Promise<{ success: boolean; error?: string }>
}

/**
 * 공지사항 스마트 고정 토글 훅
 *
 * 고정 공지사항은 한 개만 허용하므로, 새로운 공지사항을 고정하려 할 때
 * 기존 고정 공지사항을 자동으로 해제합니다.
 *
 * @param options - 고정 토글 옵션
 * @returns 스마트 토글 함수
 *
 * @example
 * ```tsx
 * const { smartTogglePin } = useSmartPin({ pinnedNotifications, togglePin })
 *
 * // 자동으로 기존 고정을 해제하고 새로운 공지사항을 고정
 * await smartTogglePin('notification-id', false)
 * ```
 */
export function useSmartPin({ pinnedNotifications, togglePin }: UseSmartPinOptions) {
  /**
   * 스마트 고정/해제 토글
   *
   * @param notificationId - 공지사항 ID
   * @param currentPinned - 현재 고정 상태
   * @returns 처리 결과
   */
  const smartTogglePin = async (
    notificationId: string,
    currentPinned: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    // 고정하려는 경우 (false → true)
    if (!currentPinned) {
      // 이미 고정된 다른 공지사항이 있는지 확인
      const existingPinned = pinnedNotifications.find(n => n.notificationId !== notificationId)

      if (existingPinned) {
        // 기존 고정 공지사항 먼저 해제
        const unpinResult = await togglePin(existingPinned.notificationId, true)
        if (!unpinResult.success) {
          return {
            success: false,
            error: unpinResult.error || '기존 고정 공지사항 해제에 실패했습니다',
          }
        }
      }
    }

    // 현재 공지사항 고정/해제
    return togglePin(notificationId, currentPinned)
  }

  return { smartTogglePin }
}
