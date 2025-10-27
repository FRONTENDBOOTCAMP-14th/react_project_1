/**
 * 회차(Round) 단건 API
 * - 경로: /api/rounds/[id]
 * - 메서드:
 *   - GET: 특정 회차 상세 조회
 *   - PATCH: 특정 회차 일부 수정
 *   - DELETE: 특정 회차 소프트 삭제
 */

import prisma from '@/lib/prisma'
import { roundSelect, roundDetailSelect } from '@/lib/quaries'
import type { UpdateRoundRequest } from '@/lib/types/round'
import type { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import { hasErrorCode } from '@/lib/errors'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { hasPermission } from '@/lib/auth'

/**
 * GET /api/rounds/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // findFirst로 소프트 삭제 조건 적용 (findUnique는 단일 필드만 가능)
    const round = await prisma.round.findFirst({
      where: {
        roundId: id,
        deletedAt: null,
      },
      select: roundDetailSelect,
    })

    if (!round) {
      return createErrorResponse('Round not found', 404)
    }

    return createSuccessResponse(round)
  } catch (error) {
    console.error('Error fetching round:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to fetch round: ${message}`, 500)
  }
}

/**
 * PATCH /api/rounds/[id]
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = (await request.json()) as UpdateRoundRequest

    // 먼저 round 존재 여부와 커뮤니티 정보 확인
    const existingRound = await prisma.round.findFirst({
      where: {
        roundId: id,
        deletedAt: null,
      },
      select: roundSelect,
    })

    if (!existingRound) {
      return createErrorResponse('회차를 찾을 수 없습니다.', 404)
    }

    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    // 팀장 권한 확인
    const hasAdminPermission = await hasPermission(userId, existingRound.clubId, 'admin')
    if (!hasAdminPermission) {
      return createErrorResponse('팀장만 회차를 수정할 수 있습니다.', 403)
    }
    const updateData: {
      roundNumber?: number
      startDate?: Date | null
      endDate?: Date | null
      location?: string | null
      updatedAt: Date
    } = {
      updatedAt: new Date(),
    }

    if (body.roundNumber !== undefined) {
      // roundNumber 유효성 검증
      if (body.roundNumber < 1 || !Number.isInteger(body.roundNumber)) {
        return createErrorResponse('roundNumber must be a positive integer', 400)
      }
      updateData.roundNumber = body.roundNumber
    }

    // 날짜 필드 처리
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null
    }

    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null
    }

    // 날짜 유효성 검증
    if (updateData.startDate && updateData.endDate) {
      if (updateData.startDate > updateData.endDate) {
        return createErrorResponse('startDate must be before or equal to endDate', 400)
      }
    }

    if (body.location !== undefined) {
      updateData.location = body.location || null
    }

    // 업데이트 실행 (race condition 방지: where에 deletedAt 조건 포함)
    try {
      const updatedRound = await prisma.round.update({
        where: {
          roundId: id,
          deletedAt: null,
        },
        data: updateData,
        select: roundSelect,
      })

      return createSuccessResponse(updatedRound)
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (hasErrorCode(error, 'P2025')) {
        return createErrorResponse('Round not found', 404)
      }
      throw error
    }
  } catch (error) {
    console.error('Error updating round:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to update round: ${message}`, 500)
  }
}

/**
 * DELETE /api/rounds/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 먼저 round 존재 여부와 커뮤니티 정보 확인
    const existingRound = await prisma.round.findFirst({
      where: {
        roundId: id,
        deletedAt: null,
      },
      select: roundSelect,
    })

    if (!existingRound) {
      return createErrorResponse('회차를 찾을 수 없습니다.', 404)
    }

    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    // 팀장 권한 확인
    const hasAdminPermission = await hasPermission(userId, existingRound.clubId, 'admin')
    if (!hasAdminPermission) {
      return createErrorResponse('팀장만 회차를 삭제할 수 있습니다.', 403)
    }

    // 소프트 삭제 수행 (race condition 방지: where에 deletedAt 조건 포함)
    try {
      await prisma.round.update({
        where: {
          roundId: id,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })

      return createSuccessResponse({ message: 'Round deleted successfully' })
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (hasErrorCode(error, 'P2025')) {
        return createErrorResponse('Round not found', 404)
      }
      throw error
    }
  } catch (error) {
    console.error('Error deleting round:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to delete round: ${message}`, 500)
  }
}
