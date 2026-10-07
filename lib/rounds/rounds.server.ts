import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { ValidatedRoundCreationData, ValidatedRoundUpdateData } from '@/lib/rounds/rounds.core'

/**
 * 다음 roundNumber 자동 증가 조회
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
 * 라운드 필터링 where 절 생성
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

  if (filters.roundNumber) {
    const parsedRoundNumber = parseInt(filters.roundNumber, 10)
    if (!Number.isNaN(parsedRoundNumber)) {
      whereClause.roundNumber = parsedRoundNumber
    }
  }

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
 * 활성 라운드 단건 조회 (clubId 검증 포함)
 */
export async function findRoundById(roundId: string, clubId: string) {
  return prisma.round.findFirst({
    where: { roundId, clubId, deletedAt: null },
  })
}

/**
 * 검증된 데이터로 라운드 생성
 */
export async function createRound(data: ValidatedRoundCreationData) {
  return prisma.round.create({
    data,
  })
}

/**
 * 라운드 정보 업데이트
 */
export async function updateRound(roundId: string, data: ValidatedRoundUpdateData) {
  return prisma.round.update({
    where: { roundId },
    data,
  })
}

/**
 * 라운드 소프트 삭제
 */
export async function softDeleteRound(roundId: string) {
  return prisma.round.update({
    where: { roundId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}
