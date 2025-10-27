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
import type { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'
import { hasErrorCode } from '@/lib/errors'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { hasPermission } from '@/lib/auth'

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
      return createErrorResponse('Notification not found', 404)
    }

    return createSuccessResponse(notification)
  } catch (error) {
    console.error('Error fetching notification:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to fetch notification: ${message}`, 500)
  }
}

/**
 * PATCH /api/notifications/[id]
 * - 권한: 작성자 또는 관리자 이상
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    // 공지사항 조회
    const existingNotification = await prisma.notification.findFirst({
      where: { notificationId: id, deletedAt: null },
      select: { authorId: true, clubId: true },
    })

    if (!existingNotification) {
      return createErrorResponse('Notification not found', 404)
    }

    // 권한 확인: 작성자 또는 관리자 이상
    const isAuthor = existingNotification.authorId === userId
    const hasAdminPermission = await hasPermission(userId, existingNotification.clubId, 'admin')
    if (!isAuthor && !hasAdminPermission) {
      return createErrorResponse('공지사항 작성자 또는 관리자만 수정할 수 있습니다.', 403)
    }

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
        return createErrorResponse('Title cannot be empty', 400)
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

      return createSuccessResponse(updatedNotification)
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (hasErrorCode(error, 'P2025')) {
        return createErrorResponse('Notification not found', 404)
      }
      throw error
    }
  } catch (error) {
    console.error('Error updating notification:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to update notification: ${message}`, 500)
  }
}

/**
 * DELETE /api/notifications/[id]
 * - 권한: 작성자 또는 관리자 이상
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

    // 공지사항 조회
    const existingNotification = await prisma.notification.findFirst({
      where: { notificationId: id, deletedAt: null },
      select: { authorId: true, clubId: true },
    })

    if (!existingNotification) {
      return createErrorResponse('Notification not found', 404)
    }

    // 권한 확인: 작성자 또는 관리자 이상
    const isAuthor = existingNotification.authorId === userId
    const hasAdminPermission = await hasPermission(userId, existingNotification.clubId, 'admin')
    if (!isAuthor && !hasAdminPermission) {
      return createErrorResponse('공지사항 작성자 또는 관리자만 삭제할 수 있습니다.', 403)
    }

    // 소프트 삭제 수행 (race condition 방지: where에 deletedAt 조건 포함)
    try {
      await prisma.notification.update({
        where: {
          notificationId: id,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })

      return createSuccessResponse({ message: 'Notification deleted successfully' })
    } catch (error: unknown) {
      // Prisma P2025: Record not found
      if (hasErrorCode(error, 'P2025')) {
        return createErrorResponse('Notification not found', 404)
      }
      throw error
    }
  } catch (error) {
    console.error('Error deleting notification:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to delete notification: ${message}`, 500)
  }
}
