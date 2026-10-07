/**
 * 리액션(Reaction) 단건 API
 * - 경로: /api/reactions/[id]
 * - 메서드:
 *   - GET: 특정 리액션 상세 조회
 *   - PATCH: 특정 리액션 일부 수정
 *   - DELETE: 특정 리액션 소프트 삭제
 */

import { hasErrorCode } from '@/lib/errors'
import { canManageReaction, validateReactionUpdate } from '@/lib/reactions/reactions.core'
import {
  findReactionById,
  softDeleteReaction,
  updateReaction,
} from '@/lib/reactions/reactions.server'
import type { UpdateReactionRequest } from '@/lib/types/reaction'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import type { NextRequest } from 'next/server'

/**
 * GET /api/reactions/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const reaction = await findReactionById(id, true)

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
    const existingReaction = await findReactionById(id)

    if (!existingReaction) {
      return createErrorResponse('Reaction not found', 404)
    }

    // 작성자 권한 확인
    if (!canManageReaction(existingReaction.userId, userId)) {
      return createErrorResponse('리액션 작성자만 수정할 수 있습니다.', 403)
    }

    const body = (await request.json()) as UpdateReactionRequest

    if (body.reaction === undefined) {
      return createErrorResponse('No fields to update', 400)
    }

    // 수정 내용 검증
    const validation = validateReactionUpdate(body)
    if (validation.isErr()) {
      return createErrorResponse(validation.error.message, 400)
    }

    // 리액션 수정 실행
    try {
      const updatedReaction = await updateReaction(id, validation.value)
      return createSuccessResponse(updatedReaction)
    } catch (error: unknown) {
      if (hasErrorCode(error, 'P2025')) {
        return createErrorResponse('Reaction not found', 404)
      }
      throw error
    }
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
    const existingReaction = await findReactionById(id)

    if (!existingReaction) {
      return createErrorResponse('Reaction not found', 404)
    }

    // 작성자 권한 확인
    if (!canManageReaction(existingReaction.userId, userId)) {
      return createErrorResponse('리액션 작성자만 삭제할 수 있습니다.', 403)
    }

    // 삭제 처리
    try {
      await softDeleteReaction(id)
      return createSuccessResponse({ message: 'Reaction deleted successfully' })
    } catch (error: unknown) {
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
