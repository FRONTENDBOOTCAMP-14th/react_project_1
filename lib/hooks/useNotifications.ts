import { API_ENDPOINTS, MESSAGES } from '@/constants'
import type {
  CreateNotificationInput,
  Notification,
  UpdateNotificationRequest,
} from '@/lib/types/notification'
import { deleter, fetcher, patcher, poster } from '@/lib/utils/swr'
import { useCallback } from 'react'
import useSWR, { mutate } from 'swr'

interface UseNotificationsOptions {
  clubId: string
  isPinned?: boolean
  page?: number
  limit?: number
}

interface UseNotificationsResult {
  notifications: Notification[]
  pinnedNotifications: Notification[]
  regularNotifications: Notification[]
  loading: boolean
  error: Error | undefined
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  refetch: () => Promise<void>
  getNotificationById: (
    notificationId: string
  ) => Promise<{ success: boolean; data?: Notification; error?: string }>
  createNotification: (
    input: CreateNotificationInput
  ) => Promise<{ success: boolean; data?: Notification; error?: string }>
  updateNotification: (
    notificationId: string,
    input: UpdateNotificationRequest
  ) => Promise<{ success: boolean; data?: Notification; error?: string }>
  deleteNotification: (notificationId: string) => Promise<{ success: boolean; error?: string }>
  togglePin: (
    notificationId: string,
    currentPinned: boolean
  ) => Promise<{ success: boolean; error?: string }>
}

// API 응답 타입 정의
interface NotificationsResponse {
  data: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * 공지사항 데이터를 관리하는 SWR 기반 커스텀 훅
 *
 * @param options - 공지사항 조회 옵션
 * @param options.clubId - 커뮤니티 ID (필수)
 * @param options.isPinned - 고정 공지사항만 조회 (선택)
 * @param options.page - 페이지 번호 (선택, 기본값: 1)
 * @param options.limit - 페이지당 개수 (선택, 기본값: 20)
 * @returns 공지사항 목록, 로딩 상태, 에러, CRUD 함수
 *
 * @example
 * ```tsx
 * const { notifications, pinnedNotifications, createNotification, togglePin } =
 *   useNotifications({ clubId: 'club-uuid' })
 *
 * // 공지사항 생성 (clubId는 자동 추가됨)
 * await createNotification({
 *   authorId: 'author-uuid',
 *   title: '공지사항 제목',
 *   content: '내용',
 *   isPinned: false
 * })
 *
 * // 고정/해제 토글
 * await togglePin('notification-uuid', false)
 * ```
 */
export const useNotifications = ({
  clubId,
  isPinned,
  page = 1,
  limit = 20,
}: UseNotificationsOptions): UseNotificationsResult => {
  // URL 구성
  const url = API_ENDPOINTS.NOTIFICATIONS.WITH_PARAMS({
    clubId,
    isPinned,
    page,
    limit,
  })

  // SWR로 데이터 페칭
  const { data: responseData, error, isLoading } = useSWR<NotificationsResponse>(url, fetcher)

  // 데이터 추출
  const notifications = responseData?.data || []
  const pagination = responseData?.pagination || null

  // 고정 공지사항과 일반 공지사항 분리
  const pinnedNotifications = notifications.filter(n => n.isPinned)
  const regularNotifications = notifications.filter(n => !n.isPinned)

  // 재조회 함수
  const refetch = useCallback(async () => {
    await mutate(url)
  }, [url])

  /**
   * 특정 공지사항 상세 조회
   * @param notificationId - 공지사항 ID
   * @returns 조회 결과
   */
  const getNotificationById = useCallback(async (notificationId: string) => {
    try {
      const data = await fetcher<Notification>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId))
      return { success: true, data }
    } catch (err) {
      console.error('Failed to fetch notification:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : MESSAGES.ERROR.FAILED_TO_LOAD_NOTIFICATIONS,
      }
    }
  }, [])

  /**
   * 새로운 공지사항 생성
   * @param input - 공지사항 생성 데이터 (clubId는 자동으로 추가됨)
   * @returns 생성 결과
   */
  const createNotification = useCallback(
    async (input: CreateNotificationInput) => {
      try {
        const data = await poster<Notification>(API_ENDPOINTS.NOTIFICATIONS.BASE, {
          ...input,
          clubId,
        })

        // 성공 시 캐시 무효화 및 재조회
        await refetch()
        return { success: true, data }
      } catch (err) {
        console.error('Failed to create notification:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : MESSAGES.ERROR.CREATING_NOTIFICATION_ERROR,
        }
      }
    },
    [clubId, refetch]
  )

  /**
   * 공지사항 수정
   * @param notificationId - 수정할 공지사항 ID
   * @param input - 수정할 데이터
   * @returns 수정 결과
   */
  const updateNotification = useCallback(
    async (notificationId: string, input: UpdateNotificationRequest) => {
      try {
        const data = await patcher<Notification>(
          API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId),
          input
        )

        // 성공 시 캐시 무효화 및 재조회
        await refetch()
        return { success: true, data }
      } catch (err) {
        console.error('Failed to update notification:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : MESSAGES.ERROR.UPDATING_NOTIFICATION_ERROR,
        }
      }
    },
    [refetch]
  )

  /**
   * 공지사항 삭제 (소프트 삭제)
   * @param notificationId - 삭제할 공지사항 ID
   * @returns 삭제 결과
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await deleter(API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId))

        // 성공 시 캐시 무효화 및 재조회
        await refetch()
        return { success: true }
      } catch (err) {
        console.error('Failed to delete notification:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : MESSAGES.ERROR.DELETING_NOTIFICATION_ERROR,
        }
      }
    },
    [refetch]
  )

  /**
   * 공지사항 고정/해제 토글
   * @param notificationId - 공지사항 ID
   * @param currentPinned - 현재 고정 상태
   * @returns 수정 결과
   */
  const togglePin = useCallback(
    async (notificationId: string, currentPinned: boolean) => {
      return updateNotification(notificationId, { isPinned: !currentPinned })
    },
    [updateNotification]
  )

  return {
    notifications,
    pinnedNotifications,
    regularNotifications,
    loading: isLoading,
    error,
    pagination,
    refetch,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    togglePin,
  }
}
