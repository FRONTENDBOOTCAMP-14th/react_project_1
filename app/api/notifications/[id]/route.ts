/**
 * 공지사항(Notification) 단건 API
 * - 경로: /api/notifications/[id]
 * - 메서드:
 *   - GET: 특정 공지사항 상세 조회
 *   - PATCH: 특정 공지사항 일부 수정
 *   - DELETE: 특정 공지사항 소프트 삭제
 */

import { hasPermission } from '@/lib/auth'
import {
  canManageNotification,
  validateNotificationUpdate,
} from '@/lib/notifications/notifications.core'
import {
  findNotificationById,
  softDeleteNotification,
  updateNotification,
} from '@/lib/notifications/notifications.server'
import type { UpdateNotificationRequest } from '@/lib/types/notification'
import { requireAuthUser } from '@/lib/utils/api-auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import type { NextRequest } from 'next/server'

/**
 * GET /api/notifications/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const notification = await findNotificationById(id, true)
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
 * - 권한: 작성자 또는 관리자 이상 (INV-N03)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 인증 확인
    const { userId, error: authError } = await requireAuthUser()
    if (authError || !userId) return authError || createErrorResponse('인증이 필요합니다.', 401)

    // 공지사항 조회
    const existingNotification = await findNotificationById(id)
    if (!existingNotification) {
      return createErrorResponse('Notification not found', 404)
    }

    // 수정 권한 확인
    const hasAdminPermission = await hasPermission(userId, existingNotification.clubId, 'admin')
    if (
      !canManageNotification(
        existingNotification.authorId,
        userId,
        hasAdminPermission ? 'admin' : 'member'
      )
    ) {
      return createErrorResponse('공지사항 작성자 또는 관리자만 수정할 수 있습니다.', 403)
    }

    const body = (await request.json()) as UpdateNotificationRequest

    // 수정 내용 검증
    const validation = validateNotificationUpdate(body)
    if (validation.isErr()) {
      return createErrorResponse(validation.error.message, 400)
    }

    // 공지사항 수정
    const updatedNotification = await updateNotification(id, validation.value)

    return createSuccessResponse(updatedNotification)
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
    const existingNotification = await findNotificationById(id)
    if (!existingNotification) {
      return createErrorResponse('Notification not found', 404)
    }

    // 삭제 권한 확인
    const hasAdminPermission = await hasPermission(userId, existingNotification.clubId, 'admin')
    if (
      !canManageNotification(
        existingNotification.authorId,
        userId,
        hasAdminPermission ? 'admin' : 'member'
      )
    ) {
      return createErrorResponse('공지사항 작성자 또는 관리자만 삭제할 수 있습니다.', 403)
    }

    // 삭제 처리
    await softDeleteNotification(id)

    return createSuccessResponse({ message: 'Notification deleted successfully' })
  } catch (error) {
    console.error('Error deleting notification:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(`Failed to delete notification: ${message}`, 500)
  }
}
