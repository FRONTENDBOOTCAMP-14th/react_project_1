/**
 * 커서 기반 커뮤니티 검색 Server Actions
 * - 기존 searchServer.ts를 커서 기반으로 개선
 */

import { getErrorMessage, SearchError } from '@/lib/errors'
import type {
  CursorPaginationParams,
  CursorPaginationResult,
} from '@/lib/pagination/cursorPagination'
import { applyCursorPagination, processCursorResult } from '@/lib/pagination/cursorPagination'
import prisma from '@/lib/prisma'
import type { Community } from '@/lib/types/community'

/**
 * 커서 기반 커뮤니티 검색 파라미터
 */
export interface CursorSearchCommunityParams extends CursorPaginationParams {
  region?: string
  subRegion?: string
  search?: string
  searchTags?: string[]
}

/**
 * 커서 기반 커뮤니티 검색 결과
 */
export interface CursorSearchCommunityResult extends CursorPaginationResult<Community> {
  filters: {
    region?: string
    subRegion?: string
    search?: string
    searchTags: string[]
  }
}

/**
 * Server Action: 커서 기반 커뮤니티 검색
 * - 'use server' 지시어로 클라이언트에서 직접 호출 가능
 * - 대용량 데이터에 최적화된 성능
 */
export async function searchCommunitiesWithCursor(
  params: CursorSearchCommunityParams
): Promise<CursorSearchCommunityResult> {
  try {
    const {
      cursor,
      limit = 10,
      direction = 'forward',
      region,
      subRegion,
      search,
      searchTags = [],
    } = params

    // 입력값 검증
    const validatedLimit = Math.min(Math.max(1, limit), 50)
    const validatedSearch = search ? search.substring(0, 200) : undefined

    // where 조건 구성
    const where = {
      deletedAt: null,
      ...(region && { region }),
      ...(subRegion && { subRegion }),
      ...(validatedSearch && {
        name: {
          contains: validatedSearch,
          mode: 'insensitive' as const,
        },
      }),
      ...(searchTags.length > 0 && {
        tagname: {
          hasSome: searchTags,
        },
      }),
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
            take: 3, // 최근 3개 라운드만
          },
        },
      },
      {
        cursor: cursorDate?.toISOString(),
        limit: validatedLimit,
        direction,
      },
      'createdAt'
    )

    // 데이터 조회
    const communities = await prisma.community.findMany(query)

    // 결과 처리 - Community 타입으로 변환
    const result = processCursorResult(
      communities as unknown as Community[],
      validatedLimit,
      direction
    )

    return {
      ...result,
      filters: {
        region,
        subRegion,
        search: validatedSearch,
        searchTags,
      },
    }
  } catch (error) {
    console.error('Cursor search communities error:', error)
    throw new SearchError(`커뮤니티 검색 중 오류가 발생했습니다: ${getErrorMessage(error)}`)
  }
}

/**
 * Server Action: 초기 검색 (첫 페이지)
 */
export async function initialSearchCommunities(
  params: Omit<CursorSearchCommunityParams, 'cursor' | 'direction'>
): Promise<CursorSearchCommunityResult> {
  return searchCommunitiesWithCursor({
    ...params,
    direction: 'forward',
  })
}

/**
 * Server Action: 다음 페이지
 */
export async function loadMoreCommunities(
  params: CursorSearchCommunityParams
): Promise<CursorSearchCommunityResult> {
  return searchCommunitiesWithCursor({
    ...params,
    direction: 'forward',
  })
}

/**
 * Server Action: 이전 페이지
 */
export async function loadPreviousCommunities(
  params: CursorSearchCommunityParams
): Promise<CursorSearchCommunityResult> {
  return searchCommunitiesWithCursor({
    ...params,
    direction: 'backward',
  })
}
