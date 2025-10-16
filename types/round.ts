/**
 * Round 타입 정의
 * Prisma Round 모델 기반
 */
export interface Round {
  roundId: string
  clubId: string
  roundNumber: number
  createdAt: Date | string
  updatedAt: Date | string
  deletedAt?: Date | string | null
}

/**
 * Round 생성 요청 타입
 */
export interface CreateRoundRequest {
  clubId: string
  roundNumber?: number
}

/**
 * Round 업데이트 요청 타입
 */
export interface UpdateRoundRequest {
  roundNumber?: number
}

/**
 * Round 조회 쿼리 파라미터 타입
 */
export interface RoundQueryParams {
  clubId?: string
}

/**
 * API 응답 타입 - 단일 회차
 */
export interface RoundResponse {
  success: boolean
  data?: Round
  error?: string
  message?: string
}

/**
 * API 응답 타입 - 회차 리스트
 */
export interface RoundListResponse {
  success: boolean
  data?: Round[]
  count?: number
  error?: string
  message?: string
}

/**
 * 회차와 관련 정보를 포함한 확장 타입
 */
export interface RoundWithRelations extends Round {
  community?: {
    clubId: string
    name: string
  }
  studyGoals?: {
    goalId: string
    title: string
    isComplete: boolean
  }[]
}
