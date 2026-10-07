/**
 * 리액션(Reaction) 컬렉션 API
 * - 경로: /api/reactions
 * - 메서드:
 *   - GET: 목록 조회(필터링 지원)
 *   - POST: 신규 리액션 생성
 */

import { MESSAGES } from '@/constants/messages'
import { findMemberById } from '@/lib/community/members.server'
import prisma from '@/lib/prisma'
import { reactionSelect } from '@/lib/queries'
import { validateReactionCreation } from '@/lib/reactions/reactions.core'
import { buildReactionWhereClause, createReaction } from '@/lib/reactions/reactions.server'
import type { CreateReactionRequest } from '@/lib/types/reaction'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { getPaginationParams, getStringParam, withPagination } from '@/lib/utils/apiHelpers'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import type { NextRequest } from 'next/server'

/**
 * GET /api/reactions
 * - 리액션 목록을 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const memberId = getStringParam(searchParams, 'memberId')
    const userId = getStringParam(searchParams, 'userId')

    // memberId는 필수
    if (!memberId) {
      return createErrorResponse('memberId is required', 400)
    }

    const { page, limit, skip } = getPaginationParams(request)

    // where 절 구성
    const whereClause = buildReactionWhereClause(memberId, userId)

    // withPagination 유틸리티 사용
    return withPagination(
      prisma.reaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: reactionSelect,
      }),
      prisma.reaction.count({ where: whereClause }),
      { page, limit, skip }
    )
  } catch (error) {
    console.error('Error fetching reactions:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to fetch reactions: ${message}`, 500)
  }
}

/**
 * POST /api/reactions
 * - 신규 리액션을 생성합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    const body = (await request.json()) as CreateReactionRequest
    const { memberId, reaction } = body

    // 필수 값 검증
    if (!memberId || !reaction) {
      return createErrorResponse('Missing required fields: memberId, reaction', 400)
    }

    // 입력값 검증
    const validation = validateReactionCreation(body, userId)
    if (validation.isErr()) {
      return createErrorResponse(validation.error.message, 400)
    }

    // 멤버 존재 확인
    const member = await findMemberById(validation.value.memberId)
    if (!member) {
      return createErrorResponse('Member not found', 404)
    }

    // 리액션 생성
    const newReaction = await createReaction(validation.value)

    return createSuccessResponse(newReaction, 201)
  } catch (error) {
    console.error('Error creating reaction:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_CREATE_REACTION, 500)
  }
}
