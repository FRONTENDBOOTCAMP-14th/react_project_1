import { MESSAGES } from '@/constants'
import { err, ok, type Result } from '@/lib/errors/result'
import { isWithinRoundWindow } from '@/lib/rounds/rounds.core'

export interface EvaluateAttendanceInput {
  userId: string
  round: {
    startDate: Date | null
    endDate: Date | null
  }
  hasExistingAttendance: boolean
  currentTime: Date
}

export interface ValidatedAttendanceData {
  attendanceDate: Date
}

export interface AttendanceRecordLike {
  attendanceType: 'present' | 'absent' | 'late' | 'excused'
}

export interface AttendanceStats {
  total: number
  present: number
  absent: number
  late: number
  excused: number
}

export interface AttendanceGroupByResultLike {
  attendanceType: string
  _count: {
    attendanceId: number
  }
}

/**
 * 출석 등록 적격성 판별 (순수 함수)
 * - 이미 출석했는지 여부 검사
 * - 라운드 시작/종료 일정이 유효한지 검사
 * - 현재 시각이 라운드 시간 윈도우 내인지 검사
 */
export function evaluateAttendanceEligibility(
  input: EvaluateAttendanceInput
): Result<ValidatedAttendanceData, Error> {
  if (input.hasExistingAttendance) {
    return err(new Error(MESSAGES.ERROR.ALREADY_ATTENDED))
  }

  const { startDate, endDate } = input.round
  if (!startDate || !endDate) {
    return err(new Error('라운드 일정이 설정되지 않았습니다'))
  }

  if (!isWithinRoundWindow(input.currentTime, startDate, endDate)) {
    return err(new Error(MESSAGES.ERROR.ATTENDANCE_TIME_INVALID))
  }

  return ok({
    attendanceDate: input.currentTime,
  })
}

export interface ValidateAttendanceRegistrationInput {
  callerRole?: string | null
  isSelf: boolean
  attendanceType: 'present' | 'absent' | 'late' | 'excused'
  round: {
    startDate: Date | null
    endDate: Date | null
  }
  hasExistingAttendance: boolean
  currentTime: Date
}

/**
 * 출석 등록 정책 및 불변식 검증 (순수 함수)
 * - 중복 출석 방지 (INV-A01)
 * - 대리 등록 시 관리자(admin/owner) 권한 필수 (INV-A04)
 * - 본인 셀프 출석 시: present 타입 필수 및 라운드 시간 윈도우 필수 (INV-A02)
 * - 관리자 대리 출석 시: 전 타입 및 사후/사전 기록 허용
 */
export function validateAttendanceRegistration(
  input: ValidateAttendanceRegistrationInput
): Result<ValidatedAttendanceData, Error> {
  if (input.hasExistingAttendance) {
    return err(new Error(MESSAGES.ERROR.ALREADY_ATTENDED))
  }

  if (!input.isSelf) {
    if (input.callerRole !== 'admin' && input.callerRole !== 'owner') {
      return err(new Error('출석을 등록할 권한이 없습니다.'))
    }
    return ok({ attendanceDate: input.currentTime })
  }

  if (input.attendanceType !== 'present') {
    return err(new Error('본인 출석은 출석(present)만 등록 가능합니다.'))
  }

  return evaluateAttendanceEligibility({
    userId: '',
    round: input.round,
    hasExistingAttendance: input.hasExistingAttendance,
    currentTime: input.currentTime,
  })
}

/**
 * 출석 관리 권한 확인 (순수 함수)
 * - 본인이거나 클럽 운영진(admin 또는 owner) 여부 확인
 */
export function canManageAttendance(
  currentUserId: string,
  targetUserId: string,
  callerRole?: string | null
): boolean {
  if (currentUserId === targetUserId) {
    return true
  }
  return callerRole === 'admin' || callerRole === 'owner'
}

/**
 * 출석 통계 계산 (순수 함수)
 */
export function calculateAttendanceStats(
  attendanceRecords: AttendanceRecordLike[]
): AttendanceStats {
  const stats: AttendanceStats = {
    total: attendanceRecords.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  }

  for (const record of attendanceRecords) {
    switch (record.attendanceType) {
      case 'present':
        stats.present++
        break
      case 'absent':
        stats.absent++
        break
      case 'late':
        stats.late++
        break
      case 'excused':
        stats.excused++
        break
    }
  }

  return stats
}

/**
 * 출석 타입별 그룹화 통계 변환 (순수 함수)
 */
export function formatAttendanceGroupByStats(groupByResults: AttendanceGroupByResultLike[]) {
  return {
    present: groupByResults.find(g => g.attendanceType === 'present')?._count.attendanceId || 0,
    absent: groupByResults.find(g => g.attendanceType === 'absent')?._count.attendanceId || 0,
    late: groupByResults.find(g => g.attendanceType === 'late')?._count.attendanceId || 0,
    excused: groupByResults.find(g => g.attendanceType === 'excused')?._count.attendanceId || 0,
  }
}
