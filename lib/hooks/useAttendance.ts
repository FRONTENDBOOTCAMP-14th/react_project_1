import type {
  Attendance,
  AttendanceFilterOptions,
  AttendanceListResponse,
  AttendanceResponse,
  AttendanceStats,
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from '@/lib/types/attendance'
import { useCallback, useEffect, useState } from 'react'

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

const API_ENDPOINTS = {
  ATTENDANCE: {
    BASE: '/api/attendance',
    BY_ID: (id: string) => `/api/attendance/${id}`,
    BY_ROUND: (roundId: string) => `/api/attendance/round/${roundId}`,
    BY_USER: (userId: string) => `/api/attendance/user/${userId}`,
  },
} as const

const HTTP_HEADERS = {
  'Content-Type': 'application/json',
} as const

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
  const [attendance, setAttendance] = useState<Attendance | null>(null)
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    totalPages: number
    total: number
  } | null>(null)

  const fetchAttendance = useCallback(async () => {
    if (attendanceId) {
      // 특정 출석 조회
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(API_ENDPOINTS.ATTENDANCE.BY_ID(attendanceId))
        const result = await response.json()

        if (result.success) {
          setAttendance(result.data)
        } else {
          setError(result.error || '출석 정보를 불러오는데 실패했습니다')
        }
      } catch (err) {
        console.error('Failed to fetch attendance:', err)
        setError('출석 정보를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    } else {
      // 출석 목록 조회
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (initialFilters) {
          Object.entries(initialFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, value.toString())
            }
          })
        }

        const response = await fetch(`${API_ENDPOINTS.ATTENDANCE.BASE}?${params}`)
        const result = await response.json()

        if (result.success) {
          setAttendanceList(result.data.data)
          setPagination(result.data.pagination)
          setStats(result.data.stats)
        } else {
          setAttendanceList([])
          setError(result.error || '출석 목록을 불러오는데 실패했습니다')
        }
      } catch (err) {
        console.error('Failed to fetch attendance list:', err)
        setError('출석 목록을 불러오는데 실패했습니다')
        setAttendanceList([])
      } finally {
        setLoading(false)
      }
    }
  }, [attendanceId, initialFilters])

  /**
   * 출석 생성
   */
  const createAttendance = useCallback(
    async (input: CreateAttendanceInput) => {
      try {
        const response = await fetch(API_ENDPOINTS.ATTENDANCE.BASE, {
          method: 'POST',
          headers: HTTP_HEADERS,
          body: JSON.stringify(input),
        })

        const result = await response.json()

        if (result.success) {
          // 생성 후 목록 새로고침
          await fetchAttendance()
          return { success: true, data: result.data }
        }
        return { success: false, error: result.error || '출석 생성에 실패했습니다' }
      } catch (err) {
        console.error('Failed to create attendance:', err)
        return { success: false, error: '출석 생성 중 오류가 발생했습니다' }
      }
    },
    [fetchAttendance]
  )

  /**
   * 출석 수정
   */
  const updateAttendance = useCallback(
    async (id: string, input: UpdateAttendanceInput) => {
      try {
        const response = await fetch(API_ENDPOINTS.ATTENDANCE.BY_ID(id), {
          method: 'PATCH',
          headers: HTTP_HEADERS,
          body: JSON.stringify(input),
        })

        const result = await response.json()

        if (result.success) {
          // 수정 후 데이터 새로고침
          if (attendanceId === id) {
            await fetchAttendance()
          }
          return { success: true, data: result.data }
        }
        return { success: false, error: result.error || '출석 수정에 실패했습니다' }
      } catch (err) {
        console.error('Failed to update attendance:', err)
        return { success: false, error: '출석 수정 중 오류가 발생했습니다' }
      }
    },
    [attendanceId, fetchAttendance]
  )

  /**
   * 출석 삭제
   */
  const deleteAttendance = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(API_ENDPOINTS.ATTENDANCE.BY_ID(id), {
          method: 'DELETE',
        })

        const result = await response.json()

        if (result.success) {
          // 삭제 후 목록 새로고침
          await fetchAttendance()
          return { success: true }
        }
        return { success: false, error: result.error || '출석 삭제에 실패했습니다' }
      } catch (err) {
        console.error('Failed to delete attendance:', err)
        return { success: false, error: '출석 삭제 중 오류가 발생했습니다' }
      }
    },
    [fetchAttendance]
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

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  return {
    attendance,
    attendanceList,
    loading,
    error,
    stats,
    pagination,
    refetch: fetchAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    getRoundAttendance,
    getUserAttendance,
  }
}
