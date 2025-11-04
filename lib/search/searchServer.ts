import prisma from '@/lib/prisma'
import type { Community } from '@/lib/types/community'

export interface SearchCommunityParams {
  region?: string
  subRegion?: string
  search?: string
  searchTags?: string[]
  page?: number
  limit?: number
}

export interface SearchCommunityResult {
  communities: Community[]
  total: number
  pagination: {
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * 서버 컴포넌트용 커뮤니티 검색 함수
 * - 직접 Prisma로 DB 접근
 * - Next.js 자동 캐싱 활용
 */
export async function searchCommunities(
  params: SearchCommunityParams
): Promise<SearchCommunityResult> {
  const { region, subRegion, search, searchTags = [], page = 1, limit = 6 } = params

  const skip = (page - 1) * limit

  // where 조건 구성
  const where = {
    deletedAt: null,
    ...(region && { region }),
    ...(subRegion && { subRegion }),
    ...(search && {
      name: {
        contains: search,
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
      take: limit,
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

  const totalPages = Math.ceil(total / limit)

  return {
    communities,
    total,
    pagination: {
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}
