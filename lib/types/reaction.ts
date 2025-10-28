/**
 * Reaction 타입 정의
 * Prisma Reaction 모델 기반 (member 기반)
 */

import type { PaginationInfo } from '@/lib/types'

export interface Reaction {
  reactionId: string
  userId: string
  memberId: string
  reaction: string
  createdAt: Date | string
  deletedAt?: Date | string | null
}

/**
 * Reaction 생성 요청 타입 (API 전송용)
 */
export interface CreateReactionRequest {
  memberId: string
  reaction: string
}

/**
 * Reaction 업데이트 요청 타입
 */
export interface UpdateReactionRequest {
  reaction?: string
}

/**
 * Reaction 조회 쿼리 파라미터 타입
 */
export interface ReactionQueryParams {
  memberId?: string
  userId?: string
}

/**
 * API 응답 타입 - 단일 리액션
 */
export interface ReactionResponse {
  success: boolean
  data?: Reaction
  error?: string
  message?: string
}

/**
 * API 응답 타입 - 리액션 리스트
 */
export interface ReactionListResponse {
  success: boolean
  data?: Reaction[]
  count?: number
  pagination?: PaginationInfo
  error?: string
  message?: string
}

/**
 * 리액션과 관련 정보를 포함한 확장 타입
 */
export interface ReactionWithRelations extends Reaction {
  user?: {
    userId: string
    username: string
    nickname?: string | null
  }
  member?: {
    id: string
    role: string
    user: {
      userId: string
      username: string
      nickname?: string | null
    }
  }
}
