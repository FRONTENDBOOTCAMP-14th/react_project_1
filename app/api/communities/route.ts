/**
 * 커뮤니티 컬렉션 API
 * - 경로: /api/communities
 * - 메서드:
 *   - GET: 목록 조회 (페이지네이션 및 필터링 지원)
 *   - POST: 신규 커뮤니티 생성
 */

import { MESSAGES } from '@/constants/messages'
import { getErrorMessage, hasErrorCode } from '@/lib/errors'
import prisma from '@/lib/prisma'
import type { CommunityWhereClause } from '@/lib/types/community'
import {
  getBooleanParam,
  getPaginationParams,
  getStringParam,
  withPagination,
} from '@/lib/utils/apiHelpers'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import type { NextRequest } from 'next/server'

/**
 * GET /api/communities
 * - 커뮤니티 목록을 조회합니다.
 * - 쿼리 파라미터
 *   - page?: number (기본값: 1)
 *   - limit?: number (기본값: 10, 최대: 100)
 *   - isPublic?: 'true'|'false' 공개 여부로 필터
 *   - search?: string 커뮤니티 이름으로 검색
 *   - createdAfter?: string (ISO 8601) 생성일 이후로 필터
 *   - createdBefore?: string (ISO 8601) 생성일 이전으로 필터
 *
 * 응답
 * - 200: { success: true, data: Community[], count: number, pagination: PaginationInfo }
 * - 500: { success: false, error: string }
 */
export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip } = getPaginationParams(request)
    const searchParams = request.nextUrl.searchParams

    // 필터링 파라미터
    const isPublic = getBooleanParam(searchParams, 'isPublic')
    const search = getStringParam(searchParams, 'search')
    const createdAfter = getStringParam(searchParams, 'createdAfter')
    const createdBefore = getStringParam(searchParams, 'createdBefore')

    // where 조건 구성
    const whereClause: CommunityWhereClause = {
      deletedAt: null,
      ...(isPublic !== null && { isPublic }),
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
      ...(createdAfter && {
        createdAt: {
          gte: new Date(createdAfter),
        },
      }),
      ...(createdBefore && {
        createdAt: {
          lte: new Date(createdBefore),
        },
      }),
    }

    // where 조건에 날짜 범위가 있는 경우 AND로 결합
    if (createdAfter && createdBefore) {
      whereClause.createdAt = {
        gte: new Date(createdAfter),
        lte: new Date(createdBefore),
      }
    }

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
          createdAt: true,
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
 *
 * 요청 Body
 * {
 *   "name": "커뮤니티 이름(필수)",
 *   "description": "설명(선택)",
 *   "isPublic": true
 * }
 *
 * 응답
 * - 201: { success: true, data: Community }
 * - 400: { success: false, error: string }
 * - 500: { success: false, error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = (body?.name ?? '').trim()
    const description = (body?.description ?? '').trim() || null
    const isPublic = Boolean(body?.is_public ?? body?.isPublic ?? true)

    // 필수 값 검증
    if (!name) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NAME_REQUIRED, 400)
    }

    // 커뮤니티 생성
    const created = await prisma.community.create({
      data: { name, description, isPublic },
      select: { clubId: true, name: true, description: true, isPublic: true, createdAt: true },
    })

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
