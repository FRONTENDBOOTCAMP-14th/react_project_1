'use server'

import { MESSAGES, REVALIDATE_PATHS } from '@/constants'
import { getCurrentUserId, hasPermission } from '@/lib/auth'
import {
  canManageNotification,
  validateNotificationCreation,
  validateNotificationUpdate,
} from '@/lib/notifications/notifications.core'
import {
  createNotification,
  findNotificationById,
  softDeleteNotification,
  updateNotification,
} from '@/lib/notifications/notifications.server'
import type { CreateNotificationRequest, UpdateNotificationRequest } from '@/lib/types/notification'
import {
  assertExists,
  ServerActionError,
  type ServerActionResponse,
  withServerAction,
} from '@/lib/utils/serverActions'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: 공지사항 생성
 */
export async function createNotificationAction(
  data: Partial<CreateNotificationRequest>
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      const clubId = data.clubId
      assertExists(clubId, 'clubId는 필수입니다')

      // 관리자 권한 확인
      const isAdmin = await hasPermission(userId, clubId, 'admin')
      if (!isAdmin) {
        throw new ServerActionError('관리자만 공지사항을 등록할 수 있습니다', 'FORBIDDEN', 403)
      }

      // 입력값 검증
      const validation = validateNotificationCreation(data, userId)
      if (validation.isErr()) {
        throw new ServerActionError(validation.error.message)
      }

      // 공지사항 생성
      const notification = await createNotification(validation.value)

      revalidatePath(REVALIDATE_PATHS.COMMUNITY(clubId))
      return notification
    },
    { errorMessage: MESSAGES.ERROR.FAILED_TO_CREATE_NOTIFICATION }
  )
}

/**
 * Server Action: 공지사항 수정
 */
export async function updateNotificationAction(
  notificationId: string,
  data: UpdateNotificationRequest
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 공지사항 조회
      const existing = await findNotificationById(notificationId)
      assertExists(existing, '공지사항을 찾을 수 없습니다')

      // 수정 권한 확인
      const isAdmin = await hasPermission(userId, existing.clubId, 'admin')
      if (!canManageNotification(existing.authorId, userId, isAdmin ? 'admin' : 'member')) {
        throw new ServerActionError('작성자 또는 관리자만 수정할 수 있습니다', 'FORBIDDEN', 403)
      }

      // 수정 내용 검증
      const validation = validateNotificationUpdate(data)
      if (validation.isErr()) {
        throw new ServerActionError(validation.error.message)
      }

      // 공지사항 수정
      const updated = await updateNotification(notificationId, validation.value)

      revalidatePath(REVALIDATE_PATHS.COMMUNITY(existing.clubId))
      return updated
    },
    { errorMessage: '공지사항 수정에 실패했습니다' }
  )
}

/**
 * Server Action: 공지사항 삭제
 */
export async function deleteNotificationAction(
  notificationId: string
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, MESSAGES.ERROR.AUTH_REQUIRED)

      // 공지사항 조회
      const existing = await findNotificationById(notificationId)
      assertExists(existing, '공지사항을 찾을 수 없습니다')

      // 삭제 권한 확인
      const isAdmin = await hasPermission(userId, existing.clubId, 'admin')
      if (!canManageNotification(existing.authorId, userId, isAdmin ? 'admin' : 'member')) {
        throw new ServerActionError('작성자 또는 관리자만 삭제할 수 있습니다', 'FORBIDDEN', 403)
      }

      // 공지사항 삭제
      await softDeleteNotification(notificationId)

      revalidatePath(REVALIDATE_PATHS.COMMUNITY(existing.clubId))
    },
    { errorMessage: '공지사항 삭제에 실패했습니다' }
  )
}
