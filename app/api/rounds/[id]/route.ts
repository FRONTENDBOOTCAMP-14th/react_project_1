/**
 * 회차(Round) 단건 API
 * - 경로: /api/rounds/[id]
 * - 메서드:
 *   - GET: 특정 회차 상세 조회
 *   - PATCH: 특정 회차 일부 수정
 *   - DELETE: 특정 회차 소프트 삭제
 */

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET /api/rounds/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const round = await prisma.round.findUnique({
      where: {
        roundId: id,
        deletedAt: null,
      },
      select: {
        roundId: true,
        clubId: true,
        roundNumber: true,
        createdAt: true,
        updatedAt: true,
        community: {
          select: {
            clubId: true,
            name: true,
          },
        },
        studyGoals: {
          where: { deletedAt: null },
          select: {
            goalId: true,
            title: true,
            isComplete: true,
          },
        },
      },
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
    const body = await request.json()

    const existingRound = await prisma.round.findUnique({
      where: { roundId: id, deletedAt: null },
    })

    if (!existingRound) {
      return NextResponse.json({ success: false, error: 'Round not found' }, { status: 404 })
    }

    const updateData: {
      roundNumber?: number
      updatedAt: Date
    } = {
      updatedAt: new Date(),
    }

    if (body.roundNumber !== undefined) updateData.roundNumber = body.roundNumber

    const updatedRound = await prisma.round.update({
      where: { roundId: id },
      data: updateData,
      select: {
        roundId: true,
        clubId: true,
        roundNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: updatedRound })
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

    const existingRound = await prisma.round.findUnique({
      where: { roundId: id, deletedAt: null },
    })

    if (!existingRound) {
      return NextResponse.json({ success: false, error: 'Round not found' }, { status: 404 })
    }

    await prisma.round.update({
      where: { roundId: id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: 'Round deleted successfully',
    })
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
