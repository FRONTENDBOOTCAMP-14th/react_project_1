/**
 * 커뮤니티 멤버(CommunityMember) 컬렉션 API
 * - 경로: /api/members
 * - 메서드:
 *   - GET: 목록 조회(필터링 지원)
 *   - POST: 신규 멤버 추가
 *
 * 주의사항
 * - 소프트 삭제(deletedAt !== null)는 목록에서 제외합니다.
 * - 모든 응답은 JSON 형태이며, 성공 여부(success)와 데이터/메시지를 포함합니다.
 */

import prisma from '@/lib/prisma'
import { memberDetailSelect, activeMemberWhere } from '@/lib/quaries'
import type { CreateMemberRequest } from '@/lib/types/member'
import type { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import { MESSAGES } from '@/constants/messages'
import { hasErrorCode } from '@/lib/errors'
import { getPaginationParams, getStringParam, withPagination } from '@/lib/utils/apiHelpers'

/**
 * GET /api/members
 * - 멤버 목록을 조회합니다.
 * - 쿼리 파라미터
 *   - clubId?: string  특정 커뮤니티로 필터
 *   - userId?: string  특정 사용자로 필터
 *   - role?: string    역할로 필터 (owner, admin, member)
 *   - page?: number    페이지 번호 (기본값: 1)
 *   - limit?: number   페이지당 항목 수 (기본값: 20, 최대: 100)
 *
 * 응답
 * - 200: { success: true, data: CommunityMember[], count: number, pagination: {...} }
 * - 500: { success: false, error: string }
 */
export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip } = getPaginationParams(request)
    const searchParams = request.nextUrl.searchParams

    // 필터링 파라미터
    const clubId = getStringParam(searchParams, 'clubId')
    const userId = getStringParam(searchParams, 'userId')
    const role = getStringParam(searchParams, 'role')

    // where 절 구성
    const whereClause = {
      ...activeMemberWhere,
      ...(clubId && { clubId }),
      ...(userId && { userId }),
      ...(role && { role }),
    }

    // withPagination 유틸리티 사용
    return withPagination(
      prisma.communityMember.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
        select: memberDetailSelect,
      }),
      prisma.communityMember.count({ where: whereClause }),
      { page, limit, skip }
    )
  } catch (error) {
    console.error('Error fetching members:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_LOAD_MEMBERS, 500)
  }
}

/**
 * POST /api/members
 * - 신규 멤버를 추가합니다.
 *
 * 요청 Body 예시
 * {
 *   "clubId": "커뮤니티ID(필수)",
 *   "userId": "사용자ID(필수)",
 *   "role": "member"  // 역할 (선택, 기본값 member)
 * }
 *
 * 응답
 * - 201: { success: true, data: CommunityMember }
 * - 400: { success: false, error: string }
 * - 404: { success: false, error: string }
 * - 409: { success: false, error: string } (이미 멤버인 경우)
 * - 500: { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateMemberRequest
    const { clubId, userId, role = 'member' } = body

    // 필수 값 검증
    if (!clubId || !userId) {
      return createErrorResponse('Missing required fields: clubId, userId', 400)
    }

    // 역할 검증
    const validRoles = ['owner', 'admin', 'member']
    if (!validRoles.includes(role)) {
      return createErrorResponse(MESSAGES.ERROR.INVALID_ROLE, 400)
    }

    // clubId 존재 확인
    const club = await prisma.community.findFirst({
      where: { clubId, deletedAt: null },
      select: { clubId: true },
    })

    if (!club) {
      return createErrorResponse(MESSAGES.ERROR.COMMUNITY_NOT_FOUND, 404)
    }

    // userId 존재 확인
    const user = await prisma.user.findFirst({
      where: { userId, deletedAt: null },
      select: { userId: true },
    })

    if (!user) {
      return createErrorResponse(MESSAGES.ERROR.USER_NOT_FOUND, 404)
    }

    // 이미 멤버인지 확인 (소프트 삭제 제외)
    const existingMember = await prisma.communityMember.findFirst({
      where: {
        clubId,
        userId,
        deletedAt: null,
      },
    })

    if (existingMember) {
      return createErrorResponse(MESSAGES.ERROR.MEMBER_ALREADY_EXISTS, 409)
    }

    const newMember = await prisma.communityMember.create({
      data: {
        clubId,
        userId,
        role,
      },
      select: memberDetailSelect,
    })

    return createSuccessResponse(newMember, 201)
  } catch (error) {
    console.error('Error creating member:', error)

    // Unique 제약 위반
    if (hasErrorCode(error, 'P2002')) {
      return createErrorResponse(MESSAGES.ERROR.MEMBER_ALREADY_EXISTS, 409)
    }

    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_CREATE_MEMBER, 500)
  }
}
