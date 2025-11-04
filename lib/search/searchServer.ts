import { getErrorMessage, SearchError } from '@/lib/errors'
import prisma from '@/lib/prisma'
import type { Community } from '@/lib/types/community'
import type { SearchParams, SearchPagination } from '@/lib/types/search'

/**
 * 커뮤니티 검색 파라미터
 */
export type SearchCommunityParams = SearchParams

/**
 * 커뮤니티 검색 결과
 */
export interface SearchCommunityResult {
  communities: Community[]
  total: number
  pagination: SearchPagination
}

/**
 * 서버 컴포넌트용 커뮤니티 검색 함수
 * - 직접 Prisma로 DB 접근
 * - Next.js 자동 캐싱 활용
 */
export async function searchCommunities(
  params: SearchCommunityParams
): Promise<SearchCommunityResult> {
  try {
    const { region, subRegion, search, searchTags = [], page = 1, limit = 6 } = params

    // 입력값 검증
    const validatedPage = Math.max(1, page)
    const validatedLimit = Math.min(Math.max(1, limit), 50) // 최대 50개로 제한
    const validatedSearch = search ? search.substring(0, 200) : undefined // 최대 200자로 제한

    const skip = (validatedPage - 1) * validatedLimit

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

    // 병렬로 데이터와 카운트 조회
    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        skip,
        take: validatedLimit,
        orderBy: { createdAt: 'desc' },
        select: {
          clubId: true,
          name: true,
          description: true,
          isPublic: true,
          region: true,
          subRegion: true,
          imageUrl: true,
          tagname: true,
          createdAt: true,
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
          },
        },
      }),
      prisma.community.count({ where }),
    ])

    const totalPages = Math.ceil(total / validatedLimit)

    return {
      communities,
      total,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        totalPages,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1,
      },
    }
  } catch (error) {
    console.error('검색 중 오류 발생:', error)
    throw new SearchError(
      getErrorMessage(error, '커뮤니티 검색 중 오류가 발생했습니다.'),
      'SEARCH_FAILED',
      500
    )
  }
}
