/**
 * 리액션(Reaction) 단건 API
 * - 경로: /api/reactions/[id]
 * - 메서드:
 *   - GET: 특정 리액션 상세 조회
 *   - PATCH: 특정 리액션 일부 수정
 *   - DELETE: 특정 리액션 소프트 삭제
 */

import prisma from '@/lib/prisma'
import { reactionSelect, reactionDetailSelect } from '@/lib/queries'
import type { UpdateReactionRequest } from '@/lib/types/reaction'
import type { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import { hasErrorCode } from '@/lib/errors'
import { requireAuthUser } from '@/lib/utils/api-auth'

/**
 * GET /api/reactions/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // findFirst로 소프트 삭제 조건 적용
    const reaction = await prisma.reaction.findFirst({
      where: {
        reactionId: id,
        deletedAt: null,
      },
      select: reactionDetailSelect,
    })

    if (!reaction) {
      return createErrorResponse('Reaction not found', 404)
    }

    return createSuccessResponse(reaction)
  } catch (error) {
    console.error('Error fetching reaction:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to fetch reaction: ${message}`, 500)
  }
}

/**
 * PATCH /api/reactions/[id]
 * - 권한: 작성자만 수정 가능
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    // 리액션 조회
    const existingReaction = await prisma.reaction.findFirst({
      where: { reactionId: id, deletedAt: null },
      select: { userId: true },
    })

    if (!existingReaction) {
      return createErrorResponse('Reaction not found', 404)
    }

    // 권한 확인: 작성자만 수정 가능
    if (existingReaction.userId !== userId) {
      return createErrorResponse('리액션 작성자만 수정할 수 있습니다.', 403)
    }

    const body = (await request.json()) as UpdateReactionRequest

    // 리액션 내용 검증
    if (body.reaction !== undefined) {
      const trimmedReaction = body.reaction.trim()
      if (!trimmedReaction) {
        return createErrorResponse('Reaction cannot be empty', 400)
      }

      // 업데이트 실행 (race condition 방지: where에 deletedAt 조건 포함)
      try {
        const updatedReaction = await prisma.reaction.update({
          where: {
            reactionId: id,
            deletedAt: null,
          },
          data: {
            reaction: trimmedReaction,
          },
          select: reactionSelect,
        })

        return createSuccessResponse(updatedReaction)
      } catch (error: unknown) {
        // Prisma P2025: Record not found
        if (hasErrorCode(error, 'P2025')) {
          return createErrorResponse('Reaction not found', 404)
        }
        throw error
      }
    }

    return createErrorResponse('No fields to update', 400)
  } catch (error) {
    console.error('Error updating reaction:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to update reaction: ${message}`, 500)
  }
}

/**
 * DELETE /api/reactions/[id]
 * - 권한: 작성자만 삭제 가능
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    // 리액션 조회
    const existingReaction = await prisma.reaction.findFirst({
      where: { reactionId: id, deletedAt: null },
      select: { userId: true },
    })

    if (!existingReaction) {
      return createErrorResponse('Reaction not found', 404)
    }

    // 권한 확인: 작성자만 삭제 가능
    if (existingReaction.userId !== userId) {
      return createErrorResponse('리액션 작성자만 삭제할 수 있습니다.', 403)
    }

    // 소프트 삭제 수행 (race condition 방지: where에 deletedAt 조건 포함)
    try {
      await prisma.reaction.update({
        where: {
          reactionId: id,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })

      return createSuccessResponse({ message: 'Reaction deleted successfully' })
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (hasErrorCode(error, 'P2025')) {
        return createErrorResponse('Reaction not found', 404)
      }
      throw error
    }
  } catch (error) {
    console.error('Error deleting reaction:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to delete reaction: ${message}`, 500)
  }
}
