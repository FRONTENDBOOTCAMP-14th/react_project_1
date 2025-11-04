/**
 * attendance.ts 유틸리티 테스트
 */

import {
  buildAttendanceCreateData,
  buildAttendanceUpdateData,
  buildAttendanceWhereClause,
  calculateAttendanceStats,
  formatAttendanceGroupByStats,
} from '../attendance'

describe('attendance utilities', () => {
  describe('buildAttendanceWhereClause', () => {
    it('기본 where 절을 생성해야 함', () => {
      const whereClause = buildAttendanceWhereClause()

      expect(whereClause).toEqual({
        deletedAt: null,
      })
    })

    it('userId 필터를 적용해야 함', () => {
      const whereClause = buildAttendanceWhereClause({
        userId: 'user-123',
      })

      expect(whereClause).toEqual({
        deletedAt: null,
        userId: 'user-123',
      })
    })

    it('roundId 필터를 적용해야 함', () => {
      const whereClause = buildAttendanceWhereClause({
        roundId: 'round-456',
      })

      expect(whereClause).toEqual({
        deletedAt: null,
        roundId: 'round-456',
      })
    })

    it('attendanceType 필터를 적용해야 함', () => {
      const whereClause = buildAttendanceWhereClause({
        attendanceType: 'present',
      })

      expect(whereClause).toEqual({
        deletedAt: null,
        attendanceType: 'present',
      })
    })

    it('날짜 범위 필터를 적용해야 함', () => {
      const startDate = new Date('2024-01-01T00:00:00Z')
      const endDate = new Date('2024-01-31T23:59:59Z')
      const whereClause = buildAttendanceWhereClause({
        startDate,
        endDate,
      })

      expect(whereClause).toEqual({
        deletedAt: null,
        attendanceDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      })
    })

    it('startDate만 적용해야 함', () => {
      const startDate = new Date('2024-01-01T00:00:00Z')
      const whereClause = buildAttendanceWhereClause({
        startDate,
      })

      expect(whereClause).toEqual({
        deletedAt: null,
        attendanceDate: {
          gte: new Date(startDate),
        },
      })
    })

    it('endDate만 적용해야 함', () => {
      const endDate = new Date('2024-01-31T23:59:59Z')
      const whereClause = buildAttendanceWhereClause({
        endDate,
      })

      expect(whereClause).toEqual({
        deletedAt: null,
        attendanceDate: {
          lte: new Date(endDate),
        },
      })
    })

    it('clubId 필터를 적용해야 함', () => {
      const whereClause = buildAttendanceWhereClause({
        clubId: 'club-789',
      })

      expect(whereClause).toEqual({
        deletedAt: null,
        round: {
          clubId: 'club-789',
          deletedAt: null,
        },
      })
    })

    it('여러 필터를 동시에 적용해야 함', () => {
      const whereClause = buildAttendanceWhereClause({
        userId: 'user-123',
        roundId: 'round-456',
        attendanceType: 'present',
        clubId: 'club-789',
      })

      expect(whereClause).toEqual({
        deletedAt: null,
        userId: 'user-123',
        roundId: 'round-456',
        attendanceType: 'present',
        round: {
          clubId: 'club-789',
          deletedAt: null,
        },
      })
    })
  })

  describe('buildAttendanceUpdateData', () => {
    it('attendanceType만 업데이트해야 함', () => {
      const updateData = buildAttendanceUpdateData({
        attendanceType: 'late',
      })

      expect(updateData).toEqual({
        attendanceType: 'late',
      })
    })

    it('attendanceDate만 업데이트해야 함', () => {
      const date = '2024-01-15T10:00:00Z'
      const updateData = buildAttendanceUpdateData({
        attendanceDate: date,
      })

      expect(updateData).toEqual({
        attendanceDate: new Date(date),
      })
    })

    it('여러 필드를 동시에 업데이트해야 함', () => {
      const date = '2024-01-15T10:00:00Z'
      const updateData = buildAttendanceUpdateData({
        attendanceType: 'excused',
        attendanceDate: date,
      })

      expect(updateData).toEqual({
        attendanceType: 'excused',
        attendanceDate: new Date(date),
      })
    })

    it('빈 입력으로 빈 객체를 반환해야 함', () => {
      const updateData = buildAttendanceUpdateData({})

      expect(updateData).toEqual({})
    })

    it('Date 객체도 처리해야 함', () => {
      const date = new Date('2024-01-15T10:00:00Z')
      const updateData = buildAttendanceUpdateData({
        attendanceDate: date,
      })

      expect(updateData.attendanceDate).toEqual(date)
    })
  })

  describe('buildAttendanceCreateData', () => {
    it('필수 필드로 생성 데이터를 만들어야 함', () => {
      const createData = buildAttendanceCreateData({
        userId: 'user-123',
        roundId: 'round-456',
        attendanceType: 'present',
      })

      expect(createData).toEqual({
        user: {
          connect: { userId: 'user-123' },
        },
        round: {
          connect: { roundId: 'round-456' },
        },
        attendanceType: 'present',
        attendanceDate: expect.any(Date),
      })
    })

    it('attendanceDate를 지정할 수 있어야 함', () => {
      const date = '2024-01-15T10:00:00Z'
      const createData = buildAttendanceCreateData({
        userId: 'user-123',
        roundId: 'round-456',
        attendanceType: 'late',
        attendanceDate: date,
      })

      expect(createData.attendanceDate).toEqual(new Date(date))
    })

    it('모든 attendanceType을 처리해야 함', () => {
      const types: Array<'present' | 'absent' | 'late' | 'excused'> = [
        'present',
        'absent',
        'late',
        'excused',
      ]

      types.forEach(type => {
        const createData = buildAttendanceCreateData({
          userId: 'user-123',
          roundId: 'round-456',
          attendanceType: type,
        })

        expect(createData.attendanceType).toBe(type)
      })
    })

    it('Date 객체도 처리해야 함', () => {
      const date = new Date('2024-01-15T10:00:00Z')
      const createData = buildAttendanceCreateData({
        userId: 'user-123',
        roundId: 'round-456',
        attendanceType: 'present',
        attendanceDate: date,
      })

      expect(createData.attendanceDate).toEqual(date)
    })
  })

  describe('calculateAttendanceStats', () => {
    it('빈 배열에 대한 통계를 생성해야 함', () => {
      const stats = calculateAttendanceStats([])

      expect(stats).toEqual({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      })
    })

    it('출석 기록을 올바르게 계산해야 함', () => {
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

    it('단일 타입만 있는 경우를 처리해야 함', () => {
      const records = [
        { attendanceType: 'present' as const },
        { attendanceType: 'present' as const },
        { attendanceType: 'present' as const },
      ]

      const stats = calculateAttendanceStats(records)

      expect(stats).toEqual({
        total: 3,
        present: 3,
        absent: 0,
        late: 0,
        excused: 0,
      })
    })

    it('다양한 출석 타입을 처리해야 함', () => {
      const records = [
        { attendanceType: 'absent' as const },
        { attendanceType: 'absent' as const },
        { attendanceType: 'late' as const },
        { attendanceType: 'late' as const },
        { attendanceType: 'late' as const },
      ]

      const stats = calculateAttendanceStats(records)

      expect(stats).toEqual({
        total: 5,
        present: 0,
        absent: 2,
        late: 3,
        excused: 0,
      })
    })
  })

  describe('formatAttendanceGroupByStats', () => {
    it('Prisma groupBy 결과를 포맷해야 함', () => {
      const groupByResults = [
        { attendanceType: 'present', _count: { attendanceId: 10 } },
        { attendanceType: 'absent', _count: { attendanceId: 3 } },
        { attendanceType: 'late', _count: { attendanceId: 2 } },
        { attendanceType: 'excused', _count: { attendanceId: 1 } },
      ]

      const stats = formatAttendanceGroupByStats(groupByResults)

      expect(stats).toEqual({
        present: 10,
        absent: 3,
        late: 2,
        excused: 1,
      })
    })

    it('빈 배열에 대해 0으로 초기화된 통계를 반환해야 함', () => {
      const stats = formatAttendanceGroupByStats([])

      expect(stats).toEqual({
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      })
    })

    it('일부 타입만 있는 경우를 처리해야 함', () => {
      const groupByResults = [
        { attendanceType: 'present', _count: { attendanceId: 15 } },
        { attendanceType: 'late', _count: { attendanceId: 5 } },
      ]

      const stats = formatAttendanceGroupByStats(groupByResults)

      expect(stats).toEqual({
        present: 15,
        absent: 0,
        late: 5,
        excused: 0,
      })
    })

    it('단일 타입만 있는 경우를 처리해야 함', () => {
      const groupByResults = [{ attendanceType: 'present', _count: { attendanceId: 20 } }]

      const stats = formatAttendanceGroupByStats(groupByResults)

      expect(stats).toEqual({
        present: 20,
        absent: 0,
        late: 0,
        excused: 0,
      })
    })

    it('0개인 경우도 올바르게 처리해야 함', () => {
      const groupByResults = [{ attendanceType: 'absent', _count: { attendanceId: 0 } }]

      const stats = formatAttendanceGroupByStats(groupByResults)

      expect(stats).toEqual({
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      })
    })
  })
})
