/**
 * 사용자 커뮤니티 및 다가오는 라운드 API
 * - 경로: /api/user/communities
 * - 메서드: GET
 * - 기능: 현재 사용자가 구독한 커뮤니티와 다가오는 라운드 조회
 */

import { MESSAGES } from '@/constants/messages'
import prisma from '@/lib/prisma'
import { roundSelect, upcomingRoundsWhere, userSubscribedCommunitiesWhere } from '@/lib/quaries'
import type { Round } from '@/lib/types/round'
import type { Community } from '@/lib/types/community'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import { getPaginationParams } from '@/lib/utils/apiHelpers'
import { requireAuthUser } from '@/lib/utils/api-auth'
import type { NextRequest } from 'next/server'
import type { PaginationInfo } from '@/lib/types'

/**
 * GET /api/user/communities
 * - 현재 사용자가 구독한 커뮤니티와 다가오는 라운드를 조회합니다.
 *
 * 응답
 * - 200: { success: true, data: { subscribedCommunities: Community[], upcomingRounds: Round[] } }
 * - 401: { success: false, error: '인증이 필요합니다.' }
 * - 500: { success: false, error: string, message?: string }
 */
/**
 * GET /api/user/communities
 * - 현재 사용자가 구독한 커뮤니티와 다가오는 라운드를 조회합니다.
 *
 * 쿼리 파라미터:
 * - page?: number (기본값: 1)
 * - limit?: number (기본값: 10, 최대: 50)
 *
 * 응답
 * - 200: { success: true, data: { subscribedCommunities: Community[], upcomingRounds: Round[], pagination: PaginationInfo } }
 * - 401: { success: false, error: '인증이 필요합니다.' }
 * - 500: { success: false, error: string, message?: string }
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인 (미들웨어가 이미 처리)
    const { userId, error } = await requireAuthUser()
    if (error || !userId) return error || createErrorResponse('인증이 필요합니다.', 401)

    // 페이지네이션 파라미터 추출
    const { page, limit, skip } = getPaginationParams(request)

    // 1. 사용자가 구독한 커뮤니티 조회 (직접 페이지네이션 구현)
    const [subscribedCommunities, totalCommunities] = await Promise.all([
      prisma.community.findMany({
        where: userSubscribedCommunitiesWhere(userId),
        select: {
          clubId: true,
          name: true,
          description: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          tagname: true,
          communityMembers: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              role: true,
              joinedAt: true,
              user: {
                select: {
                  userId: true,
                  username: true,
                  email: true,
                  nickname: true,
                },
              },
            },
          },
          rounds: {
            where: {
              deletedAt: null,
            },
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
            orderBy: {
              startDate: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }) as Promise<Community[]>,
      prisma.community.count({
        where: userSubscribedCommunitiesWhere(userId),
      }),
    ])

    const pagination: PaginationInfo = {
      page,
      limit,
      total: totalCommunities,
      totalPages: Math.ceil(totalCommunities / limit),
    }

    // 2. 사용자가 속한 모든 커뮤니티의 다가오는 라운드 조회 (전체 조회)
    const subscribedCommunityIds = subscribedCommunities.map((c: Community) => c.clubId)

    const upcomingRounds: Round[] =
      subscribedCommunityIds.length > 0
        ? await prisma.round.findMany({
            where: {
              clubId: {
                in: subscribedCommunityIds,
              },
              ...upcomingRoundsWhere(),
            },
            select: roundSelect,
            orderBy: { startDate: 'asc' },
          })
        : []

    return createSuccessResponse({
      subscribedCommunities,
      upcomingRounds,
      pagination,
    })
  } catch (error) {
    console.error('Error fetching user communities:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_FETCH_COMMUNITIES, 500)
  }
}
