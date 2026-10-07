import { MESSAGES } from '@/constants'
import {
  calculateAttendanceStats,
  canManageAttendance,
  evaluateAttendanceEligibility,
  formatAttendanceGroupByStats,
  validateAttendanceRegistration,
} from '@/lib/attendance/attendance.core'

describe('attendance.core', () => {
  describe('evaluateAttendanceEligibility', () => {
    const round = {
      startDate: new Date('2026-10-07T10:00:00Z'),
      endDate: new Date('2026-10-07T12:00:00Z'),
    }

    it('미출석 상태이며 라운드 진행 시간 내인 경우 성공 Result를 반환해야 합니다', () => {
      const now = new Date('2026-10-07T10:30:00Z')
      const result = evaluateAttendanceEligibility({
        userId: 'user-1',
        round,
        hasExistingAttendance: false,
        currentTime: now,
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.attendanceDate).toEqual(now)
      }
    })

    it('이미 출석한 경우 에러 Result를 반환해야 합니다', () => {
      const now = new Date('2026-10-07T10:30:00Z')
      const result = evaluateAttendanceEligibility({
        userId: 'user-1',
        round,
        hasExistingAttendance: true,
        currentTime: now,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe(MESSAGES.ERROR.ALREADY_ATTENDED)
      }
    })

    it('라운드 시작 및 종료 시간이 설정되지 않았으면 에러 Result를 반환해야 합니다', () => {
      const now = new Date('2026-10-07T10:30:00Z')
      const result = evaluateAttendanceEligibility({
        userId: 'user-1',
        round: { startDate: null, endDate: null },
        hasExistingAttendance: false,
        currentTime: now,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('라운드 일정이 설정되지 않았습니다')
      }
    })

    it('라운드 시작 이전 시각인 경우 에러 Result를 반환해야 합니다', () => {
      const before = new Date('2026-10-07T09:59:59Z')
      const result = evaluateAttendanceEligibility({
        userId: 'user-1',
        round,
        hasExistingAttendance: false,
        currentTime: before,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe(MESSAGES.ERROR.ATTENDANCE_TIME_INVALID)
      }
    })

    it('라운드 종료 이후 시각인 경우 에러 Result를 반환해야 합니다', () => {
      const after = new Date('2026-10-07T12:00:01Z')
      const result = evaluateAttendanceEligibility({
        userId: 'user-1',
        round,
        hasExistingAttendance: false,
        currentTime: after,
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe(MESSAGES.ERROR.ATTENDANCE_TIME_INVALID)
      }
    })
  })

  describe('canManageAttendance', () => {
    it('본인의 출석은 관리 권한이 있어야 합니다', () => {
      expect(canManageAttendance('user-1', 'user-1')).toBe(true)
      expect(canManageAttendance('user-1', 'user-1', 'member')).toBe(true)
    })

    it('관리자(admin 또는 owner)는 타인의 출석을 관리할 수 있어야 합니다', () => {
      expect(canManageAttendance('admin-1', 'user-1', 'admin')).toBe(true)
      expect(canManageAttendance('owner-1', 'user-1', 'owner')).toBe(true)
    })

    it('일반 멤버는 타인의 출석을 관리할 수 없어야 합니다', () => {
      expect(canManageAttendance('user-2', 'user-1', 'member')).toBe(false)
      expect(canManageAttendance('user-2', 'user-1', null)).toBe(false)
      expect(canManageAttendance('user-2', 'user-1', undefined)).toBe(false)
    })
  })

  describe('calculateAttendanceStats', () => {
    it('출석 통계를 정확히 계산해야 합니다', () => {
      const records = [
        { attendanceType: 'present' as const },
        { attendanceType: 'present' as const },
        { attendanceType: 'absent' as const },
        { attendanceType: 'late' as const },
        { attendanceType: 'excused' as const },
      ]

      const stats = calculateAttendanceStats(records)
      expect(stats).toEqual({
        total: 5,
        present: 2,
        absent: 1,
        late: 1,
        excused: 1,
      })
    })

    it('빈 배열인 경우 모든 항목이 0이어야 합니다', () => {
      const stats = calculateAttendanceStats([])
      expect(stats).toEqual({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      })
    })
  })

  describe('formatAttendanceGroupByStats', () => {
    it('Prisma groupBy 결과를 알맞게 포맷해야 합니다', () => {
      const groupByResults = [
        { attendanceType: 'present', _count: { attendanceId: 5 } },
        { attendanceType: 'late', _count: { attendanceId: 2 } },
      ]

      const formatted = formatAttendanceGroupByStats(groupByResults)
      expect(formatted).toEqual({
        present: 5,
        absent: 0,
        late: 2,
        excused: 0,
      })
    })
  })

  describe('validateAttendanceRegistration (Policy Invariants)', () => {
    const round = {
      startDate: new Date('2026-10-07T10:00:00Z'),
      endDate: new Date('2026-10-07T12:00:00Z'),
    }

    it('일반 멤버가 본인 출석을 absent로 셀프 등록하려고 하면 에러를 반환해야 합니다 (C-A06)', () => {
      const result = validateAttendanceRegistration({
        isSelf: true,
        callerRole: 'member',
        attendanceType: 'absent',
        round,
        hasExistingAttendance: false,
        currentTime: new Date('2026-10-07T11:00:00Z'),
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('본인 출석은 출석(present)만 등록 가능합니다.')
      }
    })

    it('관리자는 시간 윈도우와 무관하게 대리 출석(사후 absent 기록 등)을 등록할 수 있어야 합니다 (C-A07)', () => {
      const pastDate = new Date('2026-10-07T15:00:00Z')
      const result = validateAttendanceRegistration({
        isSelf: false,
        callerRole: 'admin',
        attendanceType: 'absent',
        round,
        hasExistingAttendance: false,
        currentTime: pastDate,
      })

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.attendanceDate).toEqual(pastDate)
      }
    })

    it('일반 멤버가 타인의 출석을 대리 등록하려고 하면 권한 에러를 반환해야 합니다', () => {
      const result = validateAttendanceRegistration({
        isSelf: false,
        callerRole: 'member',
        attendanceType: 'present',
        round,
        hasExistingAttendance: false,
        currentTime: new Date('2026-10-07T11:00:00Z'),
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe('출석을 등록할 권한이 없습니다.')
      }
    })

    it('관리자라도 중복 출석은 등록할 수 없어야 합니다 (INV-A01)', () => {
      const result = validateAttendanceRegistration({
        isSelf: false,
        callerRole: 'admin',
        attendanceType: 'present',
        round,
        hasExistingAttendance: true,
        currentTime: new Date('2026-10-07T11:00:00Z'),
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe(MESSAGES.ERROR.ALREADY_ATTENDED)
      }
    })

    it('본인 출석 시 라운드 시간 윈도우 밖이면 에러를 반환해야 합니다 (INV-A02)', () => {
      const result = validateAttendanceRegistration({
        isSelf: true,
        callerRole: 'member',
        attendanceType: 'present',
        round,
        hasExistingAttendance: false,
        currentTime: new Date('2026-10-07T13:00:00Z'),
      })

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe(MESSAGES.ERROR.ATTENDANCE_TIME_INVALID)
      }
    })
  })
})
