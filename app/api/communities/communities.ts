import prisma from '@/lib/prisma'
import type { Community } from '@/lib/types/community'

/**
 * 추천 커뮤니티 목록을 가져오는 함수 (서버 컴포넌트용)
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
  })

  return communities
}

/**
 * 전체 커뮤니티 목록을 가져오는 함수 (서버 컴포넌트용)
 */
export async function fetchAllCommunities(limit = 100): Promise<Community[]> {
  const communities = await prisma.community.findMany({
    where: {
      deletedAt: null,
    },
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
  })

  return communities
}
