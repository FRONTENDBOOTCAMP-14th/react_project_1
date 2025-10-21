/**
 * Notification 타입 정의
 * Prisma Notification 모델 기반
 */

import type { PaginationInfo } from '@/lib/types'

export interface Notification {
  notificationId: string
  clubId: string
  authorId?: string | null
  title: string
  content?: string | null
  isPinned: boolean
  createdAt: Date | string
  updatedAt: Date | string
  deletedAt?: Date | string | null
}

/**
 * Notification 생성 요청 타입 (API 전송용)
 */
export interface CreateNotificationRequest {
  clubId: string
  authorId: string
  title: string
  content?: string | null
  isPinned?: boolean
}

/**
 * Notification 생성 입력 타입 (훅 사용시 - clubId 자동 주입)
 */
export interface CreateNotificationInput {
  authorId: string
  title: string
  content?: string | null
  isPinned?: boolean
}

/**
 * Notification 업데이트 요청 타입
 */
export interface UpdateNotificationRequest {
  title?: string
  content?: string | null
  isPinned?: boolean
}

/**
 * Notification 조회 쿼리 파라미터 타입
 */
export interface NotificationQueryParams {
  clubId?: string
  isPinned?: boolean
}

/**
 * API 응답 타입 - 단일 공지사항
 */
export interface NotificationResponse {
  success: boolean
  data?: Notification
  error?: string
  message?: string
}

/**
 * API 응답 타입 - 공지사항 리스트
 */
export interface NotificationListResponse {
  success: boolean
  data?: Notification[]
  count?: number
  pagination?: PaginationInfo
  error?: string
  message?: string
}

/**
 * 공지사항과 관련 정보를 포함한 확장 타입
 */
export interface NotificationWithRelations extends Notification {
  community?: {
    clubId: string
    name: string
  }
  author?: {
    userId: string
    username: string
  } | null
}
