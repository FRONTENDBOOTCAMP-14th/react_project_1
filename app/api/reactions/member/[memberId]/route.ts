/**
 * 멤버별 리액션 조회 API
 * - 경로: /api/reactions/member/[memberId]
 * - 메서드:
 *   - GET: 특정 멤버에 대한 리액션 목록 조회
 */

import prisma from '@/lib/prisma'
import { activeReactionWhere, reactionDetailSelect } from '@/lib/quaries'
import { getPaginationParams, withPagination } from '@/lib/utils/apiHelpers'
import { createErrorResponse } from '@/lib/utils/response'
import type { NextRequest } from 'next/server'

/**
 * GET /api/reactions/member/[memberId]
 * - 특정 멤버에 대한 모든 리액션을 조회합니다.
 *
 * 응답
 * - 200: { success: true, data: Reaction[], count: number, pagination: {...} }
 * - 404: { success: false, error: 'Member not found' }
 * - 500: { success: false, error: string }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params
    const { page, limit, skip } = getPaginationParams(request)

    // 멤버 존재 확인
    const member = await prisma.communityMember.findFirst({
      where: { id: memberId, deletedAt: null },
      select: { id: true },
    })

    if (!member) {
      return createErrorResponse('Member not found', 404)
    }

    // where 절 구성
    const whereClause = {
      ...activeReactionWhere,
      member_id: memberId,
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
    console.error('Error fetching member reactions:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to fetch member reactions: ${message}`, 500)
  }
}
