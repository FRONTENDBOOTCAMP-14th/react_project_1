import { useEffect, useState, useCallback } from 'react'
import type {
  Notification,
  CreateNotificationInput,
  UpdateNotificationRequest,
} from '@/lib/types/notification'
import { API_ENDPOINTS, HTTP_HEADERS, MESSAGES } from '@/constants'

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
  error: string | null
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

/**
 * 공지사항 데이터를 관리하는 커스텀 훅
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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        API_ENDPOINTS.NOTIFICATIONS.WITH_PARAMS({
          clubId,
          isPinned,
          page,
          limit,
        })
      )
      const result = await response.json()

      if (result.success && result.data) {
        // API 응답 구조: { success: true, data: { data: [], count: number, pagination: {} } }
        const notificationsList = Array.isArray(result.data) ? result.data : result.data.data
        setNotifications(notificationsList || [])

        // pagination은 result.data.pagination에 있음
        if (result.data.pagination) {
          setPagination(result.data.pagination)
        }
      } else {
        setNotifications([])
        setPagination(null)
        setError(result.error || MESSAGES.ERROR.FAILED_TO_LOAD_NOTIFICATIONS)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      setError(MESSAGES.ERROR.FAILED_TO_LOAD_NOTIFICATIONS)
      setNotifications([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [clubId, isPinned, page, limit])

  /**
   * 특정 공지사항 상세 조회
   * @param notificationId - 공지사항 ID
   * @returns 조회 결과
   */
  const getNotificationById = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId))
      const result = await response.json()

      if (result.success) {
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_LOAD_NOTIFICATIONS }
    } catch (err) {
      console.error('Failed to fetch notification:', err)
      return { success: false, error: MESSAGES.ERROR.FAILED_TO_LOAD_NOTIFICATIONS }
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
        const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.BASE, {
          method: 'POST',
          headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
          body: JSON.stringify({ ...input, clubId }),
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchNotifications()
          return { success: true, data: result.data }
        }
        return {
          success: false,
          error: result.error || MESSAGES.ERROR.FAILED_TO_CREATE_NOTIFICATION,
        }
      } catch (err) {
        console.error('Failed to create notification:', err)
        return { success: false, error: MESSAGES.ERROR.CREATING_NOTIFICATION_ERROR }
      }
    },
    [clubId, fetchNotifications]
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
        const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId), {
          method: 'PATCH',
          headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
          body: JSON.stringify(input),
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchNotifications()
          return { success: true, data: result.data }
        }
        return {
          success: false,
          error: result.error || MESSAGES.ERROR.FAILED_TO_UPDATE_NOTIFICATION,
        }
      } catch (err) {
        console.error('Failed to update notification:', err)
        return { success: false, error: MESSAGES.ERROR.UPDATING_NOTIFICATION_ERROR }
      }
    },
    [fetchNotifications]
  )

  /**
   * 공지사항 삭제 (소프트 삭제)
   * @param notificationId - 삭제할 공지사항 ID
   * @returns 삭제 결과
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId), {
          method: 'DELETE',
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchNotifications()
          return { success: true }
        }
        return {
          success: false,
          error: result.error || MESSAGES.ERROR.FAILED_TO_DELETE_NOTIFICATION,
        }
      } catch (err) {
        console.error('Failed to delete notification:', err)
        return { success: false, error: MESSAGES.ERROR.DELETING_NOTIFICATION_ERROR }
      }
    },
    [fetchNotifications]
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

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // 고정 공지사항과 일반 공지사항 분리
  const pinnedNotifications = notifications.filter(n => n.isPinned)
  const regularNotifications = notifications.filter(n => !n.isPinned)

  return {
    notifications,
    pinnedNotifications,
    regularNotifications,
    loading,
    error,
    pagination,
    refetch: fetchNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    togglePin,
  }
}
