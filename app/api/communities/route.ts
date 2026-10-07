/**
 * 커뮤니티 컬렉션 API
 * - 경로: /api/communities
 * - 메서드:
 *   - GET: 목록 조회 (페이지네이션 및 필터링 지원)
 *   - POST: 신규 커뮤니티 생성
 */

import { MESSAGES } from '@/constants/messages'
import { validateCommunityCreation } from '@/lib/community/community.core'
import {
  buildCommunityWhereClause,
  createCommunityWithAdmin,
} from '@/lib/community/community.server'
import { getErrorMessage, hasErrorCode } from '@/lib/errors'
import { requireAuth } from '@/lib/middleware/auth'
import prisma from '@/lib/prisma'
import {
  getBooleanParam,
  getPaginationParams,
  getStringParam,
  withPagination,
} from '@/lib/utils/apiHelpers'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'

/**
 * GET /api/communities
 * - 커뮤니티 목록을 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip } = getPaginationParams(request)
    const searchParams = request.nextUrl.searchParams

    const whereClause = buildCommunityWhereClause({
      isPublic: getBooleanParam(searchParams, 'isPublic'),
      search: getStringParam(searchParams, 'search'),
      searchTags: searchParams.getAll('searchTags').filter(Boolean),
      createdAfter: getStringParam(searchParams, 'createdAfter'),
      createdBefore: getStringParam(searchParams, 'createdBefore'),
      userId: getStringParam(searchParams, 'userId'),
      region: getStringParam(searchParams, 'region'),
      subRegion: getStringParam(searchParams, 'subRegion'),
    })

    // withPagination 유틸리티 사용
    return withPagination(
      prisma.community.findMany({
        where: whereClause,
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
      prisma.community.count({ where: whereClause }),
      { page, limit, skip }
    )
  } catch (err: unknown) {
    console.error('Error fetching communities:', err)
    return createErrorResponse(
      getErrorMessage(err, MESSAGES.ERROR.FAILED_TO_FETCH_COMMUNITIES),
      500
    )
  }
}

/**
 * POST /api/communities
 * - 신규 커뮤니티를 생성합니다.
 */
export async function POST(req: NextRequest) {
  try {
    // 인증 확인 및 userId 가져오기
    const { error: authError, userId } = await requireAuth()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    const body = await req.json()

    // 입력값 검증
    const validation = validateCommunityCreation(body)
    if (validation.isErr()) {
      return createErrorResponse(validation.error.message, 400)
    }

    // 커뮤니티 생성 및 관리자 멤버 등록
    const created = await createCommunityWithAdmin(validation.value, userId)

    // 커뮤니티 목록 캐시 무효화
    revalidateTag('communities', 'max')

    return createSuccessResponse(created, 201)
  } catch (err: unknown) {
    console.error('Error creating community:', err)

    // Unique 제약 위반 (중복 이름)
    if (hasErrorCode(err, 'P2002')) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NAME_EXISTS, 400)
    }

    return createErrorResponse(getErrorMessage(err, MESSAGES.ERROR.FAILED_TO_CREATE_COMMUNITY), 500)
  }
}
