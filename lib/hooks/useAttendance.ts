import { API_ENDPOINTS, HTTP_HEADERS } from '@/constants/routes'
import type {
  Attendance,
  AttendanceFilterOptions,
  AttendanceListResponse,
  AttendanceResponse,
  AttendanceStats,
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from '@/lib/types/attendance'
import { fetchWithResult, getUserFriendlyErrorMessage } from '@/lib/utils/api'
import { useCallback } from 'react'
import { useAsyncData } from './useAsyncData'

interface AttendanceState {
  attendance: Attendance | null
  attendanceList: Attendance[]
  stats: AttendanceStats | null
  pagination: {
    page: number
    limit: number
    totalPages: number
    total: number
  } | null
}

const INITIAL_ATTENDANCE: AttendanceState = {
  attendance: null,
  attendanceList: [],
  stats: null,
  pagination: null,
}

interface UseAttendanceResult {
  attendance: Attendance | null
  attendanceList: Attendance[]
  loading: boolean
  error: string | null
  stats: AttendanceStats | null
  pagination: {
    page: number
    limit: number
    totalPages: number
    total: number
  } | null
  refetch: () => Promise<void>
  createAttendance: (input: CreateAttendanceInput) => Promise<AttendanceResponse>
  updateAttendance: (id: string, input: UpdateAttendanceInput) => Promise<AttendanceResponse>
  deleteAttendance: (id: string) => Promise<{ success: boolean; error?: string }>
  getRoundAttendance: (
    roundId: string,
    filters?: AttendanceFilterOptions
  ) => Promise<AttendanceListResponse>
  getUserAttendance: (
    userId: string,
    filters?: AttendanceFilterOptions
  ) => Promise<AttendanceListResponse>
}

/**
 * 출석 관리 커스텀 훅
 *
 * @param attendanceId - 특정 출석 ID (선택사항)
 * @param initialFilters - 초기 필터 옵션
 * @returns 출석 관리 함수와 상태
 *
 * @example
 * ```tsx
 * // 출석 목록 조회
 * const {
 *   attendanceList,
 *   loading,
 *   error,
 *   stats,
 *   pagination,
 *   refetch,
 *   createAttendance,
 *   updateAttendance,
 *   deleteAttendance,
 *   getRoundAttendance,
 *   getUserAttendance
 * } = useAttendance()
 *
 * // 특정 출석 조회
 * const { attendance, loading, error } = useAttendance('attendance-id')
 *
 * // 출석 생성
 * const result = await createAttendance({
 *   userId: 'user-123',
 *   roundId: 'round-456',
 *   attendanceType: 'present'
 * })
 * ```
 */
export const useAttendance = (
  attendanceId?: string,
  initialFilters?: AttendanceFilterOptions
): UseAttendanceResult => {
  const fetchAttendance = useCallback(async (): Promise<AttendanceState> => {
    if (attendanceId) {
      const result = await fetchWithResult<AttendanceResponse>(
        API_ENDPOINTS.ATTENDANCE.BY_ID(attendanceId),
        undefined,
        '출석 정보를 불러오는데 실패했습니다'
      )

      if (result.isOk()) {
        const data = result.unwrap()
        if (data.success && data.data) {
          return {
            attendance: data.data,
            attendanceList: [],
            stats: null,
            pagination: null,
          }
        }
        throw new Error(data.error || '출석 정보를 불러오는데 실패했습니다')
      }
      throw new Error(getUserFriendlyErrorMessage(result.error))
    }

    const params = new URLSearchParams()
    if (initialFilters) {
      Object.entries(initialFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const result = await fetchWithResult<AttendanceListResponse>(
      `${API_ENDPOINTS.ATTENDANCE.BASE}?${params}`,
      undefined,
      '출석 목록을 불러오는데 실패했습니다'
    )

    if (result.isOk()) {
      const data = result.unwrap()
      if (data.success && data.data) {
        return {
          attendance: null,
          attendanceList: data.data.data || [],
          stats: data.data.stats || null,
          pagination: data.data.pagination
            ? { ...data.data.pagination, total: data.data.count || 0 }
            : null,
        }
      }
      throw new Error(data.error || '출석 목록을 불러오는데 실패했습니다')
    }

    throw new Error(getUserFriendlyErrorMessage(result.error))
  }, [attendanceId, initialFilters])

  const { data, loading, error, refetch } = useAsyncData(fetchAttendance, {
    initialData: INITIAL_ATTENDANCE,
  })

  /**
   * 출석 생성
   */
  const createAttendance = useCallback(
    async (input: CreateAttendanceInput) => {
      const result = await fetchWithResult<AttendanceResponse>(
        API_ENDPOINTS.ATTENDANCE.BASE,
        {
          method: 'POST',
          headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
          body: JSON.stringify(input),
        },
        '출석 생성에 실패했습니다'
      )

      if (result.isOk()) {
        const resData = result.unwrap()
        if (resData.success) {
          await refetch()
          return { success: true, data: resData.data }
        }
        return { success: false, error: resData.error || '출석 생성에 실패했습니다' }
      }
      return { success: false, error: getUserFriendlyErrorMessage(result.error) }
    },
    [refetch]
  )

  /**
   * 출석 수정
   */
  const updateAttendance = useCallback(
    async (id: string, input: UpdateAttendanceInput) => {
      const result = await fetchWithResult<AttendanceResponse>(
        API_ENDPOINTS.ATTENDANCE.BY_ID(id),
        {
          method: 'PATCH',
          headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
          body: JSON.stringify(input),
        },
        '출석 수정에 실패했습니다'
      )

      if (result.isOk()) {
        const resData = result.unwrap()
        if (resData.success) {
          if (attendanceId === id) {
            await refetch()
          }
          return { success: true, data: resData.data }
        }
        return { success: false, error: resData.error || '출석 수정에 실패했습니다' }
      }
      return { success: false, error: getUserFriendlyErrorMessage(result.error) }
    },
    [attendanceId, refetch]
  )

  /**
   * 출석 삭제
   */
  const deleteAttendance = useCallback(
    async (id: string) => {
      const result = await fetchWithResult<{ success: boolean; error?: string }>(
        API_ENDPOINTS.ATTENDANCE.BY_ID(id),
        { method: 'DELETE' },
        '출석 삭제에 실패했습니다'
      )

      if (result.isOk()) {
        const resData = result.unwrap()
        if (resData.success) {
          await refetch()
          return { success: true }
        }
        return { success: false, error: resData.error || '출석 삭제에 실패했습니다' }
      }
      return { success: false, error: getUserFriendlyErrorMessage(result.error) }
    },
    [refetch]
  )

  /**
   * 특정 라운드의 출석 조회
   */
  const getRoundAttendance = useCallback(
    async (roundId: string, filters?: AttendanceFilterOptions) => {
      try {
        const params = new URLSearchParams()
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, value.toString())
            }
          })
        }

        const response = await fetch(`${API_ENDPOINTS.ATTENDANCE.BY_ROUND(roundId)}?${params}`)
        return await response.json()
      } catch (err) {
        console.error('Failed to fetch round attendance:', err)
        return { success: false, error: '라운드 출석 정보를 불러오는데 실패했습니다' }
      }
    },
    []
  )

  /**
   * 특정 사용자의 출석 조회
   */
  const getUserAttendance = useCallback(
    async (userId: string, filters?: AttendanceFilterOptions) => {
      try {
        const params = new URLSearchParams()
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, value.toString())
            }
          })
        }

        const response = await fetch(`${API_ENDPOINTS.ATTENDANCE.BY_USER(userId)}?${params}`)
        return await response.json()
      } catch (err) {
        console.error('Failed to fetch user attendance:', err)
        return { success: false, error: '사용자 출석 정보를 불러오는데 실패했습니다' }
      }
    },
    []
  )

  return {
    attendance: data.attendance,
    attendanceList: data.attendanceList,
    loading,
    error,
    stats: data.stats,
    pagination: data.pagination,
    refetch,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    getRoundAttendance,
    getUserAttendance,
  }
}
