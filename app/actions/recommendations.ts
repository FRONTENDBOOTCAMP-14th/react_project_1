'use server'

import { prisma } from '@/lib/prisma'
import type { Community } from '@/lib/types/community'
import { withServerAction, type ServerActionResponse } from '@/lib/utils/serverActions'

/**
 * Server Action: 추천 커뮤니티 목록 가져오기
 */
export async function getRecommendedCommunitiesAction(
  limit = 10,
  isPublic = true
): Promise<ServerActionResponse<Community[]>> {
  return withServerAction(
    async () => {
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
    },
    {
      errorMessage: '추천 커뮤니티를 불러오는데 실패했습니다',
    }
  )
}
