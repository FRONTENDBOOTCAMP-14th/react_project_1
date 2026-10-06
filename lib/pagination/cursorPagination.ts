/**
 * 커서 기반 페이지네이션 유틸리티
 * - 대용량 데이터에 최적화된 페이지네이션
 * - Server Actions와 함께 사용
 */

import type { Prisma } from '@prisma/client'

/**
 * 커서 페이지네이션 파라미터
 */
export interface CursorPaginationParams {
  cursor?: string // 직렬화된 복합 커서 (createdAt_clubId)
  limit?: number // 가져올 개수 (기본값: 10, 최대: 50)
  direction?: 'forward' | 'backward' // 방향 (기본값: forward)
}

/**
 * 커서 페이지네이션 결과
 */
export interface CursorPaginationResult<T> {
  data: T[]
  nextCursor?: string // 다음 페이지 커서
  prevCursor?: string // 이전 페이지 커서
  hasMore: boolean // 더 많은 데이터가 있는지
  hasPrevious: boolean // 이전 데이터가 있는지
}

export interface DecodedCursor {
  createdAt: Date
  clubId: string
}

/**
 * 날짜와 클럽 ID를 base64url 복합 커서로 인코딩
 */
export function encodeCursor(createdAt: Date, clubId: string): string {
  const payload = `${createdAt.toISOString()}_${clubId}`
  return Buffer.from(payload).toString('base64url')
}

/**
 * base64url 복합 커서 또는 레거시 ISO 문자열 디코딩
 */
export function decodeCursor(cursor?: string): DecodedCursor | null {
  if (!cursor || typeof cursor !== 'string') return null

  try {
    // 1. base64url 디코딩 시도
    try {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8')
      if (decoded.includes('_')) {
        const [isoDate, clubId] = decoded.split('_')
        const createdAt = new Date(isoDate)
        if (!isNaN(createdAt.getTime()) && clubId) {
          return { createdAt, clubId }
        }
      }
    } catch {
      // base64url 디코딩 실패 시 패스
    }

    // 2. 평문 복합 커서 (createdAt_clubId)
    if (cursor.includes('_')) {
      const [isoDate, clubId] = cursor.split('_')
      const createdAt = new Date(isoDate)
      if (!isNaN(createdAt.getTime()) && clubId) {
        return { createdAt, clubId }
      }
    }

    // 3. 하위 호환성: 순수 날짜 문자열
    const createdAt = new Date(cursor)
    if (isNaN(createdAt.getTime())) return null
    return { createdAt, clubId: '' }
  } catch {
    return null
  }
}

/**
 * Prisma 쿼리에 커서 페이지네이션 적용
 */
export function applyCursorPagination(
  query: Omit<Prisma.CommunityFindManyArgs, 'orderBy' | 'take' | 'skip'>,
  params: CursorPaginationParams,
  orderByField: string = 'createdAt'
): Omit<Prisma.CommunityFindManyArgs, 'skip'> {
  const { cursor, limit = 10, direction = 'forward' } = params
  const validatedLimit = Math.min(Math.max(1, limit), 50)

  const result: Omit<Prisma.CommunityFindManyArgs, 'skip'> = {
    ...query,
    take: validatedLimit + 1, // hasMore 확인을 위해 1개 더 가져오기
    orderBy: [
      {
        [orderByField]: direction === 'forward' ? 'asc' : 'desc',
      },
      { clubId: direction === 'forward' ? 'asc' : 'desc' }, // 동일한 시간일 경우 clubId로 정렬
    ],
  }

  // 커서가 있는 경우 where 조건 추가
  if (cursor) {
    const decoded = decodeCursor(cursor)
    if (decoded) {
      const baseWhere = query.where || {}
      const targetDate = decoded.createdAt
      const targetClubId = decoded.clubId

      const condition =
        direction === 'forward'
          ? targetClubId
            ? {
                OR: [
                  { [orderByField]: { gt: targetDate } },
                  {
                    [orderByField]: { equals: targetDate },
                    clubId: { gt: targetClubId },
                  },
                ],
              }
            : { [orderByField]: { gt: targetDate } }
          : targetClubId
            ? {
                OR: [
                  { [orderByField]: { lt: targetDate } },
                  {
                    [orderByField]: { equals: targetDate },
                    clubId: { lt: targetClubId },
                  },
                ],
              }
            : { [orderByField]: { lt: targetDate } }

      result.where = {
        ...baseWhere,
        ...condition,
      }
    }
  }

  return result
}

/**
 * 커서 페이지네이션 결과 처리
 */
export function processCursorResult<T extends { clubId: string; createdAt: Date }>(
  data: T[],
  limit: number,
  direction: 'forward' | 'backward'
): CursorPaginationResult<T> {
  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data

  // backward 방향인 경우 결과를 뒤집기
  const finalData = direction === 'backward' ? items.reverse() : items

  const nextCursor =
    finalData.length > 0
      ? encodeCursor(
          finalData[finalData.length - 1].createdAt,
          finalData[finalData.length - 1].clubId
        )
      : undefined
  const prevCursor =
    finalData.length > 0 ? encodeCursor(finalData[0].createdAt, finalData[0].clubId) : undefined

  return {
    data: finalData,
    nextCursor: direction === 'forward' && hasMore ? nextCursor : undefined,
    prevCursor: direction === 'backward' && hasMore ? prevCursor : undefined,
    hasMore: direction === 'forward' ? hasMore : false,
    hasPrevious: direction === 'backward' ? hasMore : false,
  }
}
