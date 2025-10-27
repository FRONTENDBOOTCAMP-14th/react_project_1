/**
 * 목표(StudyGoal) 컬렉션 API
 * - 경로: /api/goals
 * - 메서드:
 *   - GET: 목록 조회(필터링 지원)
 *   - POST: 신규 목표 생성
 *
 * 주의사항
 * - 소프트 삭제(deletedAt !== null)는 목록에서 제외합니다.
 * - 모든 응답은 JSON 형태이며, 성공 여부(success)와 데이터/메시지를 포함합니다.
 */

import { MESSAGES } from '@/constants/messages'
import prisma from '@/lib/prisma'
import { activeGoalWhere, goalSelect } from '@/lib/quaries'
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
 * - 쿼리 파라미터
 *   - clubId?: string        특정 커뮤니티(클럽) ID로 필터
 *   - roundId?: string       특정 회차 ID로 필터
 *   - isTeam?: 'true'|'false' 팀 목표 여부로 필터
 *   - isComplete?: 'true'|'false' 완료 여부로 필터
 *   - ownerId?: string       소유자(생성자) ID로 필터
 *
 * 응답
 * - 200: { success: true, data: StudyGoal[], count: number }
 * - 500: { success: false, error: string, message?: string }
 */
export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip } = getPaginationParams(request)
    const searchParams = request.nextUrl.searchParams

    // 필터 파라미터
    const clubId = getStringParam(searchParams, 'clubId')
    const roundId = getStringParam(searchParams, 'roundId')
    const isTeam = getBooleanParam(searchParams, 'isTeam')
    const isComplete = getBooleanParam(searchParams, 'isComplete')
    const ownerId = getStringParam(searchParams, 'ownerId')

    // where 절 구성
    const whereClause = {
      ...activeGoalWhere,
      ...(clubId && { clubId }),
      ...(roundId && { roundId }),
      ...(isTeam !== null && { isTeam }),
      ...(isComplete !== null && { isComplete }),
      ...(ownerId && { ownerId }),
    }

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
    // 서버 내부 오류 처리
    console.error('Error fetching goals:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_LOAD_GOALS, 500)
  }
}

/**
 * POST /api/goals
 * - 신규 목표를 생성합니다.
 *
 * 요청 Body 예시
 * {
 *   "ownerId": "사용자ID(필수)",
 *   "clubId": "클럽ID(선택, 없으면 null)",
 *   "roundId": "회차ID(선택, 없으면 null)",
 *   "title": "제목(필수)",
 *   "description": "설명(선택, 없으면 null)",
 *   "isTeam": true,               // 팀 목표 여부(기본값 false)
 *   "isComplete": false,          // 완료 여부(기본값 false)
 *   "startDate": "2025-10-01",    // ISO 날짜 문자열(필수)
 *   "endDate": "2025-12-31"       // ISO 날짜 문자열(필수)
 * }
 *
 * 응답
 * - 201: { success: true, data: StudyGoal }
 * - 400: { success: false, error: 'Missing required fields', required: [...] }
 * - 500: { success: false, error: string, message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 바디 파싱
    const body = await request.json()

    const { ownerId, clubId, roundId, title, description, isTeam, isComplete, startDate, endDate } =
      body as {
        ownerId?: string
        clubId?: string | null
        roundId?: string | null
        title?: string
        description?: string | null
        isTeam?: boolean
        isComplete?: boolean
        startDate?: string | Date
        endDate?: string | Date
      }

    // 필수 값 검증
    if (!ownerId || !title || !startDate || !endDate) {
      return createErrorResponse('Missing required fields: ownerId, title, startDate, endDate', 400)
    }

    // 날짜 변환(문자열 → Date)
    const start = new Date(startDate)
    const end = new Date(endDate)

    // 목표 생성
    const createData = {
      ownerId,
      clubId: clubId || null,
      roundId: roundId || null,
      title,
      description: description || null,
      isTeam: isTeam || false,
      isComplete: isComplete || false,
      startDate: start,
      endDate: end,
    }

    const newGoal = await prisma.studyGoal.create({
      data: createData,
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

    return createSuccessResponse(newGoal, 201)
  } catch (error) {
    // 서버 내부 오류 처리
    console.error('POST /api/goals - Error creating goal:', error)
    return createErrorResponse(MESSAGES.ERROR.FAILED_TO_CREATE_GOAL, 500)
  }
}
