import prisma from '@/lib/prisma'
import type { AttendanceFilterOptions } from '@/lib/types/attendance'
import type { Prisma } from '@prisma/client'

/**
 * 출석 필터링 where 절 생성
 */
export function buildAttendanceWhereClause(
  filters: AttendanceFilterOptions = {}
): Prisma.AttendanceWhereInput {
  const whereClause: Prisma.AttendanceWhereInput = {
    deletedAt: null,
  }

  if (filters.userId) {
    whereClause.userId = filters.userId
  }

  if (filters.roundId) {
    whereClause.roundId = filters.roundId
  }

  if (filters.attendanceType) {
    whereClause.attendanceType = filters.attendanceType
  }

  if (filters.startDate || filters.endDate) {
    const dateFilter: Prisma.DateTimeFilter = {}
    if (filters.startDate) {
      const startDate = new Date(filters.startDate)
      if (!isNaN(startDate.getTime())) {
        dateFilter.gte = startDate
      }
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate)
      if (!isNaN(endDate.getTime())) {
        dateFilter.lte = endDate
      }
    }
    if (Object.keys(dateFilter).length > 0) {
      whereClause.attendanceDate = dateFilter
    }
  }

  if (filters.clubId) {
    whereClause.round = {
      clubId: filters.clubId,
      deletedAt: null,
    }
  }

  return whereClause
}

/**
 * 출석 업데이트 데이터 생성
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
 * 출석 생성 데이터 생성
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
 * 라운드 및 사용자별 활성 출석 단건 조회
 */
export async function findAttendanceByRoundAndUser(roundId: string, userId: string) {
  return prisma.attendance.findFirst({
    where: { roundId, userId, deletedAt: null },
  })
}

/**
 * 출석 레코드 생성
 */
export async function createAttendanceRecord(
  data: Prisma.AttendanceCreateInput,
  include?: Prisma.AttendanceInclude
) {
  return prisma.attendance.create({
    data,
    ...(include ? { include } : {}),
  })
}
