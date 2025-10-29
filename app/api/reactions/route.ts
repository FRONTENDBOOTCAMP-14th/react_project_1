/**
 * 리액션(Reaction) 컬렉션 API
 * - 경로: /api/reactions
 * - 메서드:
 *   - GET: 목록 조회(필터링 지원)
 *   - POST: 신규 리액션 생성
 *
 * 주의사항
 * - 소프트 삭제(deletedAt !== null)는 목록에서 제외합니다.
 * - 모든 응답은 JSON 형태이며, 성공 여부(success)와 데이터/메시지를 포함합니다.
 */

import { MESSAGES } from '@/constants/messages'
import prisma from '@/lib/prisma'
import { activeReactionWhere, reactionSelect } from '@/lib/queries'
import type { CreateReactionRequest } from '@/lib/types/reaction'
import { getPaginationParams, getStringParam, withPagination } from '@/lib/utils/apiHelpers'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import { requireAuthUser } from '@/lib/utils/api-auth'
import type { NextRequest } from 'next/server'

/**
 * GET /api/reactions
 * - 리액션 목록을 조회합니다.
 * - 쿼리 파라미터
 *   - memberId?: string  특정 멤버 ID로 필터 (필수)
 *   - userId?: string    특정 사용자 ID로 필터
 *
 * 응답
 * - 200: { success: true, data: Reaction[], count: number, pagination: {...} }
 * - 400: { success: false, error: string }
 * - 500: { success: false, error: string, message?: string }
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
    const whereClause = {
      ...activeReactionWhere,
      member_id: memberId,
      ...(userId && { userId }),
    }

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
 * - 인증 필요
 *
 * 요청 Body 예시
 * {
 *   "memberId": "멤버ID(필수)",
 *   "reaction": "리액션 내용(필수)"
 * }
 *
 * 응답
 * - 201: { success: true, data: Reaction }
 * - 400: { success: false, error: 'Missing required fields' }
 * - 404: { success: false, error: 'Member not found' }
 * - 500: { success: false, error: string, message?: string }
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

    // 리액션 내용 검증
    const trimmedReaction = reaction.trim()
    if (!trimmedReaction) {
      return createErrorResponse('Reaction cannot be empty', 400)
    }

    // memberId 존재 확인
    const member = await prisma.communityMember.findFirst({
      where: { id: memberId, deletedAt: null },
      select: { id: true },
    })

    if (!member) {
      return createErrorResponse('Member not found', 404)
    }

    const newReaction = await prisma.reaction.create({
      data: {
        userId,
        member_id: memberId,
        reaction: trimmedReaction,
      },
      select: reactionSelect,
    })

    return createSuccessResponse(newReaction, 201)
  } catch (error) {
    console.error('Error creating reaction:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_CREATE_REACTION, 500)
  }
}
