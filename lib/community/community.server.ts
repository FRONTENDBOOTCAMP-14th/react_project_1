import prisma from '@/lib/prisma'
import { communityDetailSelect, communitySelect } from '@/lib/queries'
import type { Prisma } from '@prisma/client'
import type { ValidatedCommunityCreationData } from './community.core'
import type { UpdateCommunityInput } from '@/lib/types/community'

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
    whereClause.createdAt = {
      gte: new Date(filters.createdAfter),
    }
  }
  if (filters.createdBefore) {
    whereClause.createdAt = {
      ...(typeof whereClause.createdAt === 'object' ? whereClause.createdAt : {}),
      lte: new Date(filters.createdBefore),
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
export async function findCommunityById(clubId: string, includeDetail = false) {
  return prisma.community.findFirst({
    where: { clubId, deletedAt: null },
    select: includeDetail ? communityDetailSelect : communitySelect,
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
