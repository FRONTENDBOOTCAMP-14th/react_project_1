/**
 * 목표(StudyGoal) 단건 API
 * - 경로: /api/goals/[id]
 * - 메서드:
 *   - GET: 특정 목표 상세 조회
 *   - PATCH: 특정 목표 일부 수정
 *   - DELETE: 특정 목표 소프트 삭제
 */

import { MESSAGES } from '@/constants/messages'
import { canManageGoal, validateGoalUpdate } from '@/lib/goals/goals.core'
import { findGoalById, softDeleteGoal, updateGoal } from '@/lib/goals/goals.server'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import type { NextRequest } from 'next/server'

/**
 * GET /api/goals/[id]
 * - 단일 목표를 상세 조회합니다.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const goal = await findGoalById(id, true)
    if (!goal) {
      return createErrorResponse('Goal not found', 404)
    }

    return createSuccessResponse(goal)
  } catch (error) {
    console.error('Error fetching goal:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_LOAD_GOALS, 500)
  }
}

/**
 * PATCH /api/goals/[id]
 * - 목표 일부 필드를 부분 수정합니다.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    // 1) 대상 존재 확인
    const existingGoal = await findGoalById(id)
    if (!existingGoal) {
      return createErrorResponse('Goal not found', 404)
    }

    // 소유자 권한 확인
    if (!canManageGoal(existingGoal.ownerId, userId)) {
      return createErrorResponse('목표 소유자만 수정할 수 있습니다.', 403)
    }

    const body = await request.json()

    // 수정 내용 검증
    const validation = validateGoalUpdate(body, {
      startDate: existingGoal.startDate ? new Date(existingGoal.startDate) : null,
      endDate: existingGoal.endDate ? new Date(existingGoal.endDate) : null,
    })
    if (validation.isErr()) {
      return createErrorResponse(validation.error.message, 400)
    }

    // 목표 수정
    const updatedGoal = await updateGoal(id, validation.value)

    return createSuccessResponse(updatedGoal)
  } catch (error) {
    console.error('Error updating goal:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_UPDATE_GOAL, 500)
  }
}

/**
 * DELETE /api/goals/[id]
 * - 목표를 소프트 삭제합니다.
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

    // 목표 존재 확인
    const existingGoal = await findGoalById(id)
    if (!existingGoal) {
      return createErrorResponse('Goal not found', 404)
    }

    // 소유자 권한 확인
    if (!canManageGoal(existingGoal.ownerId, userId)) {
      return createErrorResponse('목표 소유자만 삭제할 수 있습니다.', 403)
    }

    // 목표 삭제
    await softDeleteGoal(id)

    return createSuccessResponse({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_DELETE_GOAL, 500)
  }
}
