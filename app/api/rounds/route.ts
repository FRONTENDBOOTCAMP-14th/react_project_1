/**
 * 회차(Round) 컬렉션 API
 * - 경로: /api/rounds
 * - 메서드:
 *   - GET: 목록 조회(필터링 지원)
 *   - POST: 신규 회차 생성
 *
 * 주의사항
 * - 소프트 삭제(deletedAt !== null)는 목록에서 제외합니다.
 * - 모든 응답은 JSON 형태이며, 성공 여부(success)와 데이터/메시지를 포함합니다.
 */

import prisma from '@/lib/prisma'
import { roundSelect, activeRoundWhere } from '@/lib/quaries'
import type { CreateRoundRequest } from '@/types/round'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET /api/rounds
 * - 회차 목록을 조회합니다.
 * - 쿼리 파라미터
 *   - clubId?: string  특정 커뮤니티(클럽) ID로 필터
 *
 * 응답
 * - 200: { success: true, data: Round[], count: number }
 * - 500: { success: false, error: string, message?: string }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clubId = searchParams.get('clubId')

    // 페이지네이션 파라미터
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const skip = (page - 1) * limit

    // where 절 구성
    const whereClause = {
      ...activeRoundWhere,
      ...(clubId && { clubId }),
    }

    // 병렬 조회: 데이터 + 전체 갯수
    const [rounds, total] = await Promise.all([
      prisma.round.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: roundSelect,
      }),
      prisma.round.count({ where: whereClause }),
    ])

    return NextResponse.json({
      success: true,
      data: rounds,
      count: rounds.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching rounds:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch rounds',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rounds
 * - 신규 회차를 생성합니다.
 *
 * 요청 Body 예시
 * {
 *   "clubId": "커뮤니티ID(필수)",
 *   "roundNumber": 1,  // 회차 번호(선택, 기본값 1)
 *   "startDate": "2025-10-20T14:00:00Z",  // 시작 일시(선택)
 *   "endDate": "2025-10-20T18:00:00Z",    // 종료 일시(선택)
 *   "location": "서울 강남구 스터디카페"  // 장소(선택)
 * }
 *
 * 응답
 * - 201: { success: true, data: Round }
 * - 400: { success: false, error: 'Missing required fields', required: [...] }
 * - 500: { success: false, error: string, message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateRoundRequest
    const { clubId, roundNumber, startDate, endDate, location } = body

    // 필수 값 검증
    if (!clubId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['clubId'],
        },
        { status: 400 }
      )
    }

    // roundNumber 유효성 검증
    if (roundNumber !== undefined && (roundNumber < 1 || !Number.isInteger(roundNumber))) {
      return NextResponse.json(
        {
          success: false,
          error: 'roundNumber must be a positive integer',
        },
        { status: 400 }
      )
    }

    // clubId 존재 확인
    const club = await prisma.community.findFirst({
      where: { clubId, deletedAt: null },
      select: { clubId: true },
    })

    if (!club) {
      return NextResponse.json(
        {
          success: false,
          error: 'Community not found',
        },
        { status: 404 }
      )
    }

    // 날짜 유효성 검증
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start > end) {
        return NextResponse.json(
          {
            success: false,
            error: 'startDate must be before or equal to endDate',
          },
          { status: 400 }
        )
      }
    }

    const newRound = await prisma.round.create({
      data: {
        clubId,
        roundNumber: roundNumber ?? 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
      },
      select: roundSelect,
    })

    return NextResponse.json(
      {
        success: true,
        data: newRound,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating round:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create round',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
