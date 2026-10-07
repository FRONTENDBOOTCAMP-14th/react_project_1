/**
 * 커뮤니티 데이터 접근 계층 (단일 진실 공급원 SSOT)
 * - CRUD, 상세 조회, 추천 목록, 커서 기반 페이지네이션 통합
 */

import prisma from '@/lib/prisma'
import { communitySelect } from '@/lib/queries'
import type { Prisma } from '@prisma/client'
import type { ValidatedCommunityCreationData } from './community.core'
import type { Community, UpdateCommunityInput } from '@/lib/types/community'
import type { Round } from '@/lib/types/round'
import type {
  CursorPaginationParams,
  CursorPaginationResult,
} from '@/lib/pagination/cursorPagination'
import { applyCursorPagination, processCursorResult } from '@/lib/pagination/cursorPagination'

export interface CommunityDetail extends Community {
  rounds: Round[]
  notifications: Array<{
    notificationId: string
    title: string
    content: string | null
    isPinned: boolean
    createdAt: Date
  }>
  memberCount: number
}

export interface CursorCommunitiesParams extends CursorPaginationParams {
  isPublic?: boolean
  region?: string
}

export interface CursorCommunitiesResult extends CursorPaginationResult<Community> {
  filters: {
    isPublic?: boolean
    region?: string
  }
}

export interface CommunityFilterParams {
  isPublic?: boolean
  region?: string | null
  subRegion?: string | null
  search?: string | null
  searchTags?: string[]
  createdAfter?: string | null
  createdBefore?: string | null
  userId?: string | null
}

/**
 * 커뮤니티 필터링 where 절 생성
 */
export function buildCommunityWhereClause(
  filters: CommunityFilterParams = {}
): Prisma.CommunityWhereInput {
  const whereClause: Prisma.CommunityWhereInput = {
    deletedAt: null,
  }

  if (filters.isPublic !== undefined) {
    whereClause.isPublic = filters.isPublic
  }
  if (filters.region) {
    whereClause.region = filters.region
  }
  if (filters.subRegion) {
    whereClause.subRegion = filters.subRegion
  }
  if (filters.search) {
    whereClause.name = {
      contains: filters.search,
      mode: 'insensitive',
    }
  }
  if (filters.searchTags && filters.searchTags.length > 0) {
    whereClause.tagname = {
      hasSome: filters.searchTags,
    }
  }
  if (filters.createdAfter) {
    const afterDate = new Date(filters.createdAfter)
    if (!isNaN(afterDate.getTime())) {
      whereClause.createdAt = {
        gte: afterDate,
      }
    }
  }
  if (filters.createdBefore) {
    const beforeDate = new Date(filters.createdBefore)
    if (!isNaN(beforeDate.getTime())) {
      whereClause.createdAt = {
        ...(typeof whereClause.createdAt === 'object' ? whereClause.createdAt : {}),
        lte: beforeDate,
      }
    }
  }
  if (filters.userId) {
    whereClause.communityMembers = {
      some: {
        userId: filters.userId,
        deletedAt: null,
      },
    }
  }

  return whereClause
}

/**
 * 커뮤니티 단건 조회 (소프트 삭제 제외)
 */
export async function findCommunityById(clubId: string) {
  return prisma.community.findFirst({
    where: { clubId, deletedAt: null },
    select: communitySelect,
  })
}

/**
 * 트랜잭션을 통한 커뮤니티 생성 및 관리자 멤버 등록
 */
export async function createCommunityWithAdmin(
  data: ValidatedCommunityCreationData,
  adminUserId: string
) {
  return prisma.$transaction(async tx => {
    const community = await tx.community.create({
      data: {
        name: data.name,
        description: data.description,
        isPublic: data.isPublic,
        region: data.region,
        subRegion: data.subRegion,
        tagname: data.tagname,
        imageUrl: data.imageUrl,
      },
      select: communitySelect,
    })

    await tx.communityMember.create({
      data: {
        clubId: community.clubId,
        userId: adminUserId,
        role: 'admin',
      },
    })

    return community
  })
}

/**
 * 커뮤니티 정보 업데이트
 */
export async function updateCommunity(clubId: string, data: Partial<UpdateCommunityInput>) {
  return prisma.community.update({
    where: { clubId, deletedAt: null },
    data,
    select: communitySelect,
  })
}

/**
 * 커뮤니티 소프트 삭제
 */
export async function softDeleteCommunity(clubId: string) {
  return prisma.community.update({
    where: { clubId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

/**
 * 서버 컴포넌트용 커뮤니티 상세 정보 조회
 * - 한 번의 쿼리로 모든 관련 데이터 조회
 * - Soft delete 필터 적용
 * - 호출 시점 기준 동적 시간으로 미래 라운드 필터링
 */
export async function getCommunityDetail(clubId: string): Promise<CommunityDetail | null> {
  try {
    const now = new Date()
    const community = await prisma.community.findFirst({
      where: { clubId, deletedAt: null },
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
        updatedAt: true,
        rounds: {
          select: {
            roundId: true,
            clubId: true,
            roundNumber: true,
            startDate: true,
            endDate: true,
            location: true,
            createdAt: true,
            updatedAt: true,
          },
          where: {
            deletedAt: null,
            startDate: {
              gte: now,
            },
          },
          orderBy: { roundNumber: 'desc' },
        },
        notifications: {
          select: {
            notificationId: true,
            title: true,
            content: true,
            isPinned: true,
            createdAt: true,
          },
          where: { deletedAt: null },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          take: 5,
        },
        communityMembers: {
          select: { id: true },
          where: { deletedAt: null },
        },
      },
    })

    if (!community) {
      return null
    }

    const { communityMembers, ...rest } = community

    const communityDetail: CommunityDetail = {
      ...rest,
      memberCount: communityMembers.length,
    }

    return communityDetail
  } catch (error) {
    console.error('커뮤니티 상세 정보 조회 실패:', error)
    return null
  }
}

/**
 * 추천 커뮤니티 목록 조회 (서버 컴포넌트용)
 * - 공개 커뮤니티만 조회
 * - 최신순 정렬
 */
export async function fetchRecommendedCommunities(
  limit = 10,
  isPublic = true
): Promise<Community[]> {
  const communities = await prisma.community.findMany({
    where: {
      deletedAt: null,
      isPublic,
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: communitySelect,
  })

  return communities
}

/**
 * 커서 기반 커뮤니티 목록 조회
 */
export async function fetchCommunitiesWithCursor(
  params: CursorCommunitiesParams = {}
): Promise<CursorCommunitiesResult> {
  const { cursor, limit = 20, direction = 'forward', isPublic, region } = params

  const where = {
    deletedAt: null,
    ...(isPublic !== undefined && { isPublic }),
    ...(region && { region }),
  }

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
      cursor,
      limit,
      direction,
    },
    'createdAt'
  )

  const communities = await prisma.community.findMany(query)
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
 * 초기 커뮤니티 목록 조회
 */
export async function fetchInitialCommunities(
  params: Omit<CursorCommunitiesParams, 'cursor' | 'direction'> = {}
): Promise<CursorCommunitiesResult> {
  return fetchCommunitiesWithCursor({
    ...params,
    direction: 'forward',
  })
}
