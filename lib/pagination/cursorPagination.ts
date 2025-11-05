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
  cursor?: string // 마지막으로 본 아이템 ID
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
      { clubId: 'asc' }, // 동일한 시간일 경우 clubId로 정렬
    ],
  }

  // 커서가 있는 경우 where 조건 추가
  if (cursor) {
    const baseWhere = query.where || {}

    result.where = {
      ...baseWhere,
      ...(direction === 'forward'
        ? {
            OR: [
              { [orderByField]: { gt: cursor } },
              {
                [orderByField]: { equals: cursor },
                clubId: { gt: cursor },
              },
            ],
          }
        : {
            OR: [
              { [orderByField]: { lt: cursor } },
              {
                [orderByField]: { equals: cursor },
                clubId: { lt: cursor },
              },
            ],
          }),
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
    finalData.length > 0 ? finalData[finalData.length - 1].createdAt.toISOString() : undefined
  const prevCursor = finalData.length > 0 ? finalData[0].createdAt.toISOString() : undefined

  return {
    data: finalData,
    nextCursor: direction === 'forward' && hasMore ? nextCursor : undefined,
    prevCursor: direction === 'backward' && hasMore ? prevCursor : undefined,
    hasMore: direction === 'forward' ? hasMore : false,
    hasPrevious: direction === 'backward' ? hasMore : false,
  }
}
