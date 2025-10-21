/**
 * 공지사항(Notification) 단건 API
 * - 경로: /api/notifications/[id]
 * - 메서드:
 *   - GET: 특정 공지사항 상세 조회
 *   - PATCH: 특정 공지사항 일부 수정
 *   - DELETE: 특정 공지사항 소프트 삭제
 */

import prisma from '@/lib/prisma'
import { notificationSelect, notificationDetailSelect } from '@/lib/quaries'
import type { UpdateNotificationRequest } from '@/lib/types/notification'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET /api/notifications/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // findFirst로 소프트 삭제 조건 적용 (findUnique는 단일 필드만 가능)
    const notification = await prisma.notification.findFirst({
      where: {
        notificationId: id,
        deletedAt: null,
      },
      select: notificationDetailSelect,
    })

    if (!notification) {
      return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: notification })
  } catch (error) {
    console.error('Error fetching notification:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/[id]
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = (await request.json()) as UpdateNotificationRequest

    // 동적 업데이트 데이터 구성
    const updateData: {
      title?: string
      content?: string | null
      isPinned?: boolean
      updatedAt: Date
    } = {
      updatedAt: new Date(),
    }

    if (body.title !== undefined) {
      const trimmedTitle = body.title.trim()
      if (!trimmedTitle) {
        return NextResponse.json(
          { success: false, error: 'Title cannot be empty' },
          { status: 400 }
        )
      }
      updateData.title = trimmedTitle
    }

    if (body.content !== undefined) {
      updateData.content = body.content?.trim() || null
    }

    if (body.isPinned !== undefined) {
      updateData.isPinned = body.isPinned
    }

    // 업데이트 실행 (race condition 방지: where에 deletedAt 조건 포함)
    try {
      const updatedNotification = await prisma.notification.update({
        where: {
          notificationId: id,
          deletedAt: null,
        },
        data: updateData,
        select: notificationSelect,
      })

      return NextResponse.json({ success: true, data: updatedNotification })
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 소프트 삭제 수행 (race condition 방지: where에 deletedAt 조건 포함)
    try {
      await prisma.notification.update({
        where: {
          notificationId: id,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })

      return NextResponse.json({
        success: true,
        message: 'Notification deleted successfully',
      })
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
