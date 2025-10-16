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

    const whereClause: {
      deletedAt: null
      clubId?: string
    } = {
      deletedAt: null,
    }

    if (clubId) {
      whereClause.clubId = clubId
    }

    const rounds = await prisma.round.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        roundId: true,
        clubId: true,
        roundNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: rounds,
      count: rounds.length,
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
 *   "roundNumber": 1  // 회차 번호(선택, 기본값 1)
 * }
 *
 * 응답
 * - 201: { success: true, data: Round }
 * - 400: { success: false, error: 'Missing required fields', required: [...] }
 * - 500: { success: false, error: string, message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clubId, roundNumber } = body as {
      clubId?: string
      roundNumber?: number
    }

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

    const newRound = await prisma.round.create({
      data: {
        clubId,
        roundNumber: roundNumber || 1,
      },
      select: {
        roundId: true,
        clubId: true,
        roundNumber: true,
        createdAt: true,
        updatedAt: true,
      },
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
