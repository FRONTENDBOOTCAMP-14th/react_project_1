/**
 * 커서 기반 커뮤니티 목록 Server Actions
 */

import prisma from '@/lib/prisma'
import type { Community } from '@/lib/types/community'
import type {
  CursorPaginationParams,
  CursorPaginationResult,
} from '@/lib/pagination/cursorPagination'
import { applyCursorPagination, processCursorResult } from '@/lib/pagination/cursorPagination'

/**
 * 커서 기반 커뮤니티 목록 조회 파라미터
 */
export interface CursorCommunitiesParams extends CursorPaginationParams {
  isPublic?: boolean
  region?: string
}

/**
 * 커서 기반 커뮤니티 목록 조회 결과
 */
export interface CursorCommunitiesResult extends CursorPaginationResult<Community> {
  filters: {
    isPublic?: boolean
    region?: string
  }
}

/**
 * Server Action: 커서 기반 커뮤니티 목록 조회
 */
export async function fetchCommunitiesWithCursor(
  params: CursorCommunitiesParams = {}
): Promise<CursorCommunitiesResult> {
  const { cursor, limit = 20, direction = 'forward', isPublic, region } = params

  // where 조건 구성
  const where = {
    deletedAt: null,
    ...(isPublic !== undefined && { isPublic }),
    ...(region && { region }),
  }

  // 커서 날짜 파싱
  let cursorDate: Date | undefined
  if (cursor) {
    try {
      cursorDate = new Date(cursor)
      if (isNaN(cursorDate.getTime())) {
        cursorDate = undefined
      }
    } catch {
      cursorDate = undefined
    }
  }

  // Prisma 쿼리에 커서 페이지네이션 적용
  const query = applyCursorPagination(
    {
      where,
      select: {
        clubId: true,
        name: true,
        description: true,
        isPublic: true,
        region: true,
        subRegion: true,
        tagname: true,
        createdAt: true,
        imageUrl: true,
        rounds: {
          select: {
            roundId: true,
            roundNumber: true,
            startDate: true,
            endDate: true,
            location: true,
          },
          where: {
            deletedAt: null,
            startDate: {
              gte: new Date(),
            },
          },
          orderBy: { roundNumber: 'desc' },
          take: 3,
        },
      },
    },
    {
      cursor: cursorDate?.toISOString(),
      limit,
      direction,
    },
    'createdAt'
  )

  // 데이터 조회
  const communities = await prisma.community.findMany(query)

  // 결과 처리 - Community 타입으로 변환
  const result = processCursorResult(communities as unknown as Community[], limit, direction)

  return {
    ...result,
    filters: {
      isPublic,
      region,
    },
  }
}

/**
 * Server Action: 초기 커뮤니티 목록
 */
export async function fetchInitialCommunities(
  params: Omit<CursorCommunitiesParams, 'cursor' | 'direction'> = {}
): Promise<CursorCommunitiesResult> {
  return fetchCommunitiesWithCursor({
    ...params,
    direction: 'forward',
  })
}
