/**
 * StudyGoal 타입 정의
 * Prisma StudyGoal 모델 기반
 */

import type { PaginationInfo } from '@/lib/types'

export interface StudyGoal {
  goalId: string
  ownerId: string
  clubId: string | null
  roundId?: string | null
  title: string
  description: string | null
  isTeam: boolean
  isComplete: boolean
  startDate: Date | string
  endDate: Date | string
  createdAt: Date | string
  updatedAt: Date | string
  deletedAt?: Date | string | null
}

/**
 * 목표 생성을 위한 입력 데이터 타입
 */
export interface CreateGoalInput {
  ownerId: string
  clubId?: string | null
  roundId?: string | null
  title: string
  description?: string | null
  isTeam?: boolean
  isComplete?: boolean
  startDate: string | Date
  endDate: string | Date
}

/**
 * 목표 수정을 위한 입력 데이터 타입 (부분 업데이트)
 */
export interface UpdateGoalInput {
  title?: string
  description?: string | null
  isTeam?: boolean
  isComplete?: boolean
  roundId?: string | null
  startDate?: string | Date
  endDate?: string | Date
}

/**
 * StudyGoal 생성 요청 타입
 */
export interface CreateStudyGoalRequest {
  ownerId: string
  clubId?: string | null
  roundId?: string | null
  title: string
  description?: string | null
  isTeam?: boolean
  isComplete?: boolean
  startDate: Date | string
  endDate: Date | string
}

/**
 * StudyGoal 업데이트 요청 타입
 */
export interface UpdateStudyGoalRequest {
  title?: string
  description?: string | null
  isTeam?: boolean
  isComplete?: boolean
  roundId?: string | null
  startDate?: Date | string
  endDate?: Date | string
}

/**
 * StudyGoal 조회 쿼리 파라미터 타입
 */
export interface StudyGoalQueryParams {
  clubId?: string
  roundId?: string
  isTeam?: boolean
  isComplete?: boolean
  ownerId?: string
}

/**
 * API 응답 타입 - 단일 목표
 */
export interface StudyGoalResponse {
  success: boolean
  data?: StudyGoal
  error?: string
  message?: string
}

/**
 * API 응답 타입 - 목표 리스트
 */
export interface StudyGoalListResponse {
  success: boolean
  data?: StudyGoal[]
  count?: number
  pagination?: PaginationInfo
  error?: string
  message?: string
}

/**
 * 목표와 관련 정보를 포함한 확장 타입
 */
export interface StudyGoalWithRelations extends StudyGoal {
  owner?: {
    userId: string
    username: string
    email: string
  }
  club?: {
    clubId: string
    name: string
  } | null
  round?: {
    roundId: string
    roundNumber: number
    createdAt: Date | string
  } | null
}
