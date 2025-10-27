/**
 * 출석 기본 인터페이스
 */
export interface AttendanceBase {
  attendanceId: string
  userId: string
  roundId: string
  attendanceDate: Date
  attendanceType: 'present' | 'absent' | 'late' | 'excused'
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

/**
 * 상세 출석 정보 (관계 포함)
 */
export interface Attendance extends AttendanceBase {
  user?: {
    userId: string
    username: string
    nickname: string | null
    email: string | null
  }
  round?: {
    roundId: string
    roundNumber: number
    startDate: Date | null
    endDate: Date | null
    location: string | null
    community: {
      clubId: string
      name: string
    }
  }
}

/**
 * 출석 생성을 위한 입력 데이터 타입
 */
export interface CreateAttendanceInput {
  userId: string
  roundId: string
  attendanceType: 'present' | 'absent' | 'late' | 'excused'
  attendanceDate?: Date
}

/**
 * 출석 수정을 위한 입력 데이터 타입 (부분 업데이트)
 */
export interface UpdateAttendanceInput {
  attendanceType?: 'present' | 'absent' | 'late' | 'excused'
  attendanceDate?: Date
}

/**
 * 출석 검색/필터링 옵션
 */
export interface AttendanceFilterOptions {
  userId?: string | null
  roundId?: string | null
  attendanceType?: 'present' | 'absent' | 'late' | 'excused' | null
  startDate?: Date | null
  endDate?: Date | null
  clubId?: string | null
}

/**
 * API 응답 타입 - 단일 출석
 */
export interface AttendanceResponse {
  success: boolean
  data?: Attendance
  error?: string
  message?: string
}

/**
 * API 응답 타입 - 출석 리스트 (페이지네이션 포함)
 */
export interface AttendanceListResponse {
  success: boolean
  data?: {
    data: AttendanceBase[]
    count: number
    pagination: {
      page: number
      limit: number
      totalPages: number
    }
  }
  error?: string
  message?: string
}

/**
 * 출석 통계 정보
 */
export interface AttendanceStats {
  totalAttendance: number
  presentCount: number
  absentCount: number
  lateCount: number
  excusedCount: number
  attendanceRate: number // 백분율
}
