/**
 * Attendance 관련 유틸리티 함수들
 */

import type { AttendanceFilterOptions } from '@/lib/types/attendance'
import type { Prisma } from '@prisma/client'

/**
 * Attendance 필터링 where 절 생성
 * @param filters - 필터 옵션
 * @returns Prisma where 조건
 */
export function buildAttendanceWhereClause(
  filters: AttendanceFilterOptions = {}
): Prisma.AttendanceWhereInput {
  const whereClause: Prisma.AttendanceWhereInput = {
    deletedAt: null,
  }

  // 기본 필터들
  if (filters.userId) {
    whereClause.userId = filters.userId
  }

  if (filters.roundId) {
    whereClause.roundId = filters.roundId
  }

  if (filters.attendanceType) {
    whereClause.attendanceType = filters.attendanceType
  }

  // 날짜 범위 필터
  if (filters.startDate || filters.endDate) {
    whereClause.attendanceDate = {}
    if (filters.startDate) {
      ;(whereClause.attendanceDate as Prisma.DateTimeFilter).gte = new Date(filters.startDate)
    }
    if (filters.endDate) {
      ;(whereClause.attendanceDate as Prisma.DateTimeFilter).lte = new Date(filters.endDate)
    }
  }

  // 라운드 조건 (특정 커뮤니티의 라운드로 필터링)
  if (filters.clubId) {
    whereClause.round = {
      clubId: filters.clubId,
      deletedAt: null,
    }
  }

  return whereClause
}

/**
 * Attendance 업데이트 데이터 생성
 * @param input - 업데이트 입력 데이터
 * @returns Prisma 업데이트 데이터
 */
export function buildAttendanceUpdateData(input: {
  attendanceType?: 'present' | 'absent' | 'late' | 'excused'
  attendanceDate?: Date | string
}): Prisma.AttendanceUpdateInput {
  const updateData: Prisma.AttendanceUpdateInput = {}

  if (input.attendanceType) {
    updateData.attendanceType = input.attendanceType
  }

  if (input.attendanceDate) {
    updateData.attendanceDate = new Date(input.attendanceDate)
  }

  return updateData
}

/**
 * Attendance 생성 데이터 생성
 * @param input - 생성 입력 데이터
 * @returns Prisma 생성 데이터
 */
export function buildAttendanceCreateData(input: {
  userId: string
  roundId: string
  attendanceType: 'present' | 'absent' | 'late' | 'excused'
  attendanceDate?: Date | string
}): Prisma.AttendanceCreateInput {
  return {
    user: {
      connect: { userId: input.userId },
    },
    round: {
      connect: { roundId: input.roundId },
    },
    attendanceType: input.attendanceType,
    attendanceDate: input.attendanceDate ? new Date(input.attendanceDate) : new Date(),
  }
}

/**
 * Attendance 통계 계산
 * @param attendanceRecords - 출석 기록 배열
 * @returns 통계 정보
 */
export function calculateAttendanceStats(
  attendanceRecords: Array<{
    attendanceType: 'present' | 'absent' | 'late' | 'excused'
  }>
) {
  const stats = {
    total: attendanceRecords.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  }

  attendanceRecords.forEach(record => {
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
  })

  return stats
}

/**
 * 출석 타입별 그룹화 통계 생성 (Prisma groupBy 결과 변환)
 * @param groupByResults - Prisma groupBy 결과
 * @returns 타입별 개수 객체
 */
export function formatAttendanceGroupByStats(
  groupByResults: Array<{
    attendanceType: string
    _count: { attendanceId: number }
  }>
) {
  return {
    present: groupByResults.find(g => g.attendanceType === 'present')?._count.attendanceId || 0,
    absent: groupByResults.find(g => g.attendanceType === 'absent')?._count.attendanceId || 0,
    late: groupByResults.find(g => g.attendanceType === 'late')?._count.attendanceId || 0,
    excused: groupByResults.find(g => g.attendanceType === 'excused')?._count.attendanceId || 0,
  }
}
