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

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
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
    // URLSearchParams에서 필터 파라미터 추출
    const searchParams = request.nextUrl.searchParams
    const clubId = searchParams.get('clubId')
    const roundId = searchParams.get('roundId')
    const isTeam = searchParams.get('isTeam')
    const isComplete = searchParams.get('isComplete')
    const ownerId = searchParams.get('ownerId')

    // 동적 where 절 구성 (소프트 삭제 제외 조건 포함)
    const whereClause: {
      deletedAt: null
      clubId?: string
      roundId?: string
      isTeam?: boolean
      isComplete?: boolean
      ownerId?: string
    } = {
      deletedAt: null,
    }

    // clubId 필터 적용
    if (clubId) {
      whereClause.clubId = clubId
    }

    // roundId 필터 적용
    if (roundId) {
      whereClause.roundId = roundId
    }

    // isTeam 필터 적용 ('true'/'false' 문자열을 boolean으로 변환)
    if (isTeam !== null && isTeam !== undefined) {
      whereClause.isTeam = isTeam === 'true'
    }

    // isComplete 필터 적용
    if (isComplete !== null && isComplete !== undefined) {
      whereClause.isComplete = isComplete === 'true'
    }

    // ownerId 필터 적용
    if (ownerId) {
      whereClause.ownerId = ownerId
    }

    // 최신 생성 순으로 목록 조회
    const goals = await prisma.studyGoal.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        goalId: true,
        ownerId: true,
        clubId: true,
        title: true,
        description: true,
        isTeam: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: goals,
      count: goals.length,
    })
  } catch (error) {
    // 서버 내부 오류 처리
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch goals',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
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
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['ownerId', 'title', 'startDate', 'endDate'],
        },
        { status: 400 }
      )
    }

    // 날짜 변환(문자열 → Date)
    const start = new Date(startDate)
    const end = new Date(endDate)

    // 목표 생성
    const newGoal = await prisma.studyGoal.create({
      data: {
        ownerId,
        clubId: clubId || null,
        roundId: roundId || null,
        title,
        description: description || null,
        isTeam: isTeam || false,
        isComplete: isComplete || false,
        startDate: start,
        endDate: end,
      },
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

    return NextResponse.json(
      {
        success: true,
        data: newGoal,
      },
      { status: 201 }
    )
  } catch (error) {
    // 서버 내부 오류 처리
    console.error('Error creating goal:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create goal',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
