/**
 * 사용자별 리액션 조회 API
 * - 경로: /api/reactions/user/[userId]
 * - 메서드:
 *   - GET: 특정 사용자가 작성한 리액션 목록 조회
 */

import prisma from '@/lib/prisma'
import { activeReactionWhere, reactionDetailSelect } from '@/lib/queries'
import { getPaginationParams, withPagination } from '@/lib/utils/apiHelpers'
import { createErrorResponse } from '@/lib/utils/response'
import type { NextRequest } from 'next/server'

/**
 * GET /api/reactions/user/[userId]
 * - 특정 사용자가 작성한 모든 리액션을 조회합니다.
 *
 * 응답
 * - 200: { success: true, data: Reaction[], count: number, pagination: {...} }
 * - 404: { success: false, error: 'User not found' }
 * - 500: { success: false, error: string }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { page, limit, skip } = getPaginationParams(request)

    // 사용자 존재 확인
    const user = await prisma.user.findFirst({
      where: { userId, deletedAt: null },
      select: { userId: true },
    })

    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    // where 절 구성
    const whereClause = {
      ...activeReactionWhere,
      userId,
    }

    // withPagination 유틸리티 사용
    return withPagination(
      prisma.reaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: reactionDetailSelect,
      }),
      prisma.reaction.count({ where: whereClause }),
      { page, limit, skip }
    )
  } catch (error) {
    console.error('Error fetching user reactions:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to fetch user reactions: ${message}`, 500)
  }
}
