/**
 * Rounds API 유틸리티 함수
 */

import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

/**
 * RoundNumber 자동 증가 로직
 * @param clubId - 커뮤니티 ID
 * @returns 다음 roundNumber
 */
export async function getNextRoundNumber(clubId: string): Promise<number> {
  const lastRound = await prisma.round.findFirst({
    where: {
      clubId,
      deletedAt: null,
    },
    orderBy: {
      roundNumber: 'desc',
    },
    select: {
      roundNumber: true,
    },
  })
  return (lastRound?.roundNumber ?? 0) + 1
}

/**
 * Round 필터링 where 절 생성
 * @param clubId - 커뮤니티 ID (필수)
 * @param filters - 필터 옵션
 * @returns Prisma where 조건
 */
export function buildRoundWhereClause(
  clubId: string,
  filters: {
    roundNumber?: string | null
    startDateFrom?: string | null
    startDateTo?: string | null
    endDateFrom?: string | null
    endDateTo?: string | null
  } = {}
): Prisma.RoundWhereInput {
  const whereClause: Prisma.RoundWhereInput = {
    deletedAt: null,
    clubId,
  }

  // roundNumber 필터
  if (filters.roundNumber) {
    whereClause.roundNumber = parseInt(filters.roundNumber, 10)
  }

  // 날짜 범위 필터
  const dateConditions: Prisma.RoundWhereInput[] = []

  if (filters.startDateFrom) {
    dateConditions.push({
      startDate: {
        gte: new Date(filters.startDateFrom),
      },
    })
  }

  if (filters.startDateTo) {
    dateConditions.push({
      startDate: {
        lte: new Date(filters.startDateTo),
      },
    })
  }

  if (filters.endDateFrom) {
    dateConditions.push({
      endDate: {
        gte: new Date(filters.endDateFrom),
      },
    })
  }

  if (filters.endDateTo) {
    dateConditions.push({
      endDate: {
        lte: new Date(filters.endDateTo),
      },
    })
  }

  if (dateConditions.length > 0) {
    whereClause.AND = dateConditions
  }

  return whereClause
}

/**
 * 페이지네이션 정보 생성
 * @param page - 현재 페이지
 * @param limit - 페이지당 항목 수
 * @param total - 전체 항목 수
 * @returns 페이지네이션 정보
 */
export function createPaginationInfo(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}
