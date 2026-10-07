import { err, ok, type Result } from '@/lib/errors/result'
import type { CreateNotificationRequest, UpdateNotificationRequest } from '@/lib/types/notification'

export interface ValidatedNotificationCreationData {
  clubId: string
  authorId: string
  title: string
  content: string | null
  isPinned: boolean
}

export interface ValidatedNotificationUpdateData {
  title?: string
  content?: string | null
  isPinned?: boolean
  updatedAt: Date
}

/**
 * 공지사항 생성 입력값 검증 및 정제
 */
export function validateNotificationCreation(
  data: Partial<CreateNotificationRequest>,
  authorId: string
): Result<ValidatedNotificationCreationData, Error> {
  const clubId = data.clubId?.trim()
  if (!clubId || clubId.length === 0) {
    return err(new Error('clubId는 필수입니다'))
  }

  const title = data.title?.trim()
  if (!title || title.length === 0) {
    return err(new Error('공지사항 제목을 입력해주세요'))
  }
  if (title.length > 200) {
    return err(new Error('공지사항 제목은 200자 이하여야 합니다'))
  }

  const content = data.content?.trim() || null
  const isPinned = Boolean(data.isPinned)

  return ok({
    clubId,
    authorId,
    title,
    content,
    isPinned,
  })
}

/**
 * 공지사항 수정 입력값 검증 및 정제
 */
export function validateNotificationUpdate(
  data: UpdateNotificationRequest
): Result<ValidatedNotificationUpdateData, Error> {
  if (data.title === undefined && data.content === undefined && data.isPinned === undefined) {
    return err(new Error('수정할 내용이 없습니다'))
  }

  const result: ValidatedNotificationUpdateData = {
    updatedAt: new Date(),
  }

  if (data.title !== undefined) {
    const title = data.title.trim()
    if (!title || title.length === 0) {
      return err(new Error('공지사항 제목을 입력해주세요'))
    }
    if (title.length > 200) {
      return err(new Error('공지사항 제목은 200자 이하여야 합니다'))
    }
    result.title = title
  }

  if (data.content !== undefined) {
    result.content = data.content?.trim() || null
  }

  if (data.isPinned !== undefined) {
    result.isPinned = Boolean(data.isPinned)
  }

  return ok(result)
}

/**
 * 공지사항 수정/삭제 권한 판별
 * - 작성자 본인이거나 해당 모임의 관리자(admin/owner)인 경우 허용
 */
export function canManageNotification(
  notificationAuthorId: string | null | undefined,
  currentUserId: string,
  callerRole?: string | null
): boolean {
  if (notificationAuthorId && notificationAuthorId === currentUserId) {
    return true
  }
  return callerRole === 'admin' || callerRole === 'owner'
}
