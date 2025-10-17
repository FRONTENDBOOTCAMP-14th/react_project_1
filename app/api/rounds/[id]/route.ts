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
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
      return NextResponse.json({ success: false, error: 'Round not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: round })
  } catch (error) {
    console.error('Error fetching round:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch round',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/rounds/[id]
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = (await request.json()) as UpdateRoundRequest

    // 동적 업데이트 데이터 구성
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
        return NextResponse.json(
          {
            success: false,
            error: 'roundNumber must be a positive integer',
          },
          { status: 400 }
        )
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
        return NextResponse.json(
          {
            success: false,
            error: 'startDate must be before or equal to endDate',
          },
          { status: 400 }
        )
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

      return NextResponse.json({ success: true, data: updatedRound })
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return NextResponse.json({ success: false, error: 'Round not found' }, { status: 404 })
      }
      throw error
    }
  } catch (error) {
    console.error('Error updating round:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update round',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
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

    // 소프트 삭제 수행 (race condition 방지: where에 deletedAt 조건 포함)
    try {
      await prisma.round.update({
        where: {
          roundId: id,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })

      return NextResponse.json({
        success: true,
        message: 'Round deleted successfully',
      })
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return NextResponse.json({ success: false, error: 'Round not found' }, { status: 404 })
      }
      throw error
    }
  } catch (error) {
    console.error('Error deleting round:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete round',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
