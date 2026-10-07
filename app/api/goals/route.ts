/**
 * 목표(StudyGoal) 컬렉션 API
 * - 경로: /api/goals
 * - 메서드:
 *   - GET: 목록 조회(필터링 지원)
 *   - POST: 신규 목표 생성
 */

import { MESSAGES } from '@/constants/messages'
import { validateGoalCreation } from '@/lib/goals/goals.core'
import { buildGoalWhereClause, createGoal } from '@/lib/goals/goals.server'
import prisma from '@/lib/prisma'
import { goalSelect } from '@/lib/queries'
import { requireAuthUser } from '@/lib/utils/api-auth'
import {
  getBooleanParam,
  getPaginationParams,
  getStringParam,
  withPagination,
} from '@/lib/utils/apiHelpers'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import type { NextRequest } from 'next/server'

/**
 * GET /api/goals
 * - 목표 목록을 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip } = getPaginationParams(request)
    const searchParams = request.nextUrl.searchParams

    // 필터 파라미터 구성
    const whereClause = buildGoalWhereClause({
      clubId: getStringParam(searchParams, 'clubId'),
      roundId: getStringParam(searchParams, 'roundId'),
      isTeam: getBooleanParam(searchParams, 'isTeam'),
      isComplete: getBooleanParam(searchParams, 'isComplete'),
      ownerId: getStringParam(searchParams, 'ownerId'),
    })

    // withPagination 유틸리티 사용
    return withPagination(
      prisma.studyGoal.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: goalSelect,
      }),
      prisma.studyGoal.count({ where: whereClause }),
      { page, limit, skip }
    )
  } catch (error) {
    console.error('Error fetching goals:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_LOAD_GOALS, 500)
  }
}

/**
 * POST /api/goals
 * - 신규 목표를 생성합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const { userId: authUserId, error: authError } = await requireAuthUser()
    if (authError || !authUserId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    // 요청 바디 파싱
    const body = await request.json()

    // 입력값 검증
    const validation = validateGoalCreation(body, authUserId)
    if (validation.isErr()) {
      return createErrorResponse(validation.error.message, 400)
    }

    // 목표 생성
    const newGoal = await createGoal(validation.value)

    return createSuccessResponse(newGoal, 201)
  } catch (error) {
    console.error('POST /api/goals - Error creating goal:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_CREATE_GOAL, 500)
  }
}
