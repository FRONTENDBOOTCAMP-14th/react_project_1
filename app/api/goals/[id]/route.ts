/**
 * 목표(StudyGoal) 단건 API
 * - 경로: /api/goals/[id]
 * - 메서드:
 *   - GET: 특정 목표 상세 조회
 *   - PATCH: 특정 목표 일부 수정
 *   - DELETE: 특정 목표 소프트 삭제(deletedAt 설정)
 *
 * 공통 정책
 * - 소프트 삭제된 레코드(deletedAt !== null)는 조회/수정/삭제 대상에서 제외합니다.
 * - 모든 응답은 JSON으로 반환하며, success 플래그와 데이터/메시지를 포함합니다.
 * - 에러 상황에서 상태 코드와 간단한 에러 메시지를 제공합니다.
 */

import prisma from '@/lib/prisma'
import { goalDetailSelect } from '@/lib/quaries'
import type { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import { MESSAGES } from '@/constants/messages'
import { hasErrorCode } from '@/lib/errors'

/**
 * GET /api/goals/[id]
 * - 단일 목표를 상세 조회합니다.
 * - 파라미터
 *   - params.id: 조회할 목표의 goalId(필수)
 *
 * 응답
 * - 200: { success: true, data: StudyGoal(with owner, club) }
 * - 404: { success: false, error: 'Goal not found' }
 * - 500: { success: false, error: 'Failed to fetch goal', message?: string }
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // findFirst로 소프트 삭제 조건 적용 (findUnique는 단일 필드만 가능)
    const goal = await prisma.studyGoal.findFirst({
      where: {
        goalId: id,
        deletedAt: null,
      },
      select: goalDetailSelect,
    })

    // 존재하지 않거나 소프트 삭제된 경우
    if (!goal) {
      return createErrorResponse('Goal not found', 404)
    }

    // 성공 응답
    return createSuccessResponse(goal)
  } catch (error) {
    // 예외 처리(로깅 포함)
    console.error('Error fetching goal:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_LOAD_GOALS, 500)
  }
}

/**
 * PATCH /api/goals/[id]
 * - 목표 일부 필드를 부분 수정합니다(Partial Update).
 * - 파라미터
 *   - params.id: 수정할 목표의 goalId(필수)
 * - 요청 Body(전부 선택)
 *   - title?: string
 *   - description?: string | null
 *   - isTeam?: boolean
 *   - isComplete?: boolean
 *   - roundId?: string | null
 *   - startDate?: string | Date(ISO 문자열 또는 Date)
 *   - endDate?: string | Date(ISO 문자열 또는 Date)
 *
 * 응답
 * - 200: { success: true, data: UpdatedStudyGoal }
 * - 404: { success: false, error: 'Goal not found' }
 * - 500: { success: false, error: 'Failed to update goal', message?: string }
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // 1) 대상 존재 확인(소프트 삭제 제외)
    const existingGoal = await prisma.studyGoal.findUnique({
      where: { goalId: id, deletedAt: null },
    })

    if (!existingGoal) {
      return createErrorResponse('Goal not found', 404)
    }

    // 2) 동적 업데이트 데이터 구성
    const updateData: {
      title?: string
      description?: string | null
      isTeam?: boolean
      isComplete?: boolean
      roundId?: string | null
      startDate?: Date
      endDate?: Date
      updatedAt: Date
    } = {
      updatedAt: new Date(),
    }

    // 존재하는 키만 반영
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.isTeam !== undefined) updateData.isTeam = body.isTeam
    if (body.isComplete !== undefined) updateData.isComplete = body.isComplete
    if (body.roundId !== undefined) updateData.roundId = body.roundId
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)

    // 3) 업데이트 실행
    const updatedGoal = await prisma.studyGoal.update({
      where: { goalId: id },
      data: updateData,
      select: {
        goalId: true,
        ownerId: true,
        clubId: true,
        roundId: true,
        title: true,
        description: true,
        isTeam: true,
        isComplete: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // 성공 응답
    return createSuccessResponse(updatedGoal)
  } catch (error) {
    // 예외 처리(로깅 포함)
    console.error('Error updating goal:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_UPDATE_GOAL, 500)
  }
}

/**
 * DELETE /api/goals/[id]
 * - 목표를 소프트 삭제합니다. 실제 삭제가 아닌 deletedAt 타임스탬프를 설정합니다.
 * - 파라미터
 *   - params.id: 삭제할 목표의 goalId(필수)
 *
 * 응답
 * - 200: { success: true, message: 'Goal deleted successfully' }
 * - 404: { success: false, error: 'Goal not found' }
 * - 500: { success: false, error: 'Failed to delete goal', message?: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 소프트 삭제 수행 (race condition 방지: where에 deletedAt 조건 포함)
    try {
      await prisma.studyGoal.update({
        where: {
          goalId: id,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })

      return createSuccessResponse({ message: 'Goal deleted successfully' })
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (hasErrorCode(error, 'P2025')) {
        return createErrorResponse('Goal not found', 404)
      }
      throw error
    }
  } catch (error) {
    // 예외 처리(로깅 포함)
    console.error('Error deleting goal:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_DELETE_GOAL, 500)
  }
}
