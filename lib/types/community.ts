import type { PaginationInfo } from './index'

/**
 * 공통 필드를 포함한 커뮤니티 기본 인터페이스
 */
export interface CommunityBase {
  clubId: string
  name: string
  description: string | null
  isPublic: boolean
  region?: string | null
  subRegion?: string | null
  imageUrl?: string | null
  createdAt: Date
}

/**
 * 단일 커뮤니티 화면을 위한 상세 커뮤니티 정보
 */
export interface Community extends CommunityBase {
  tagname?: string[]
  _count?: {
    communityMembers: number
  }
}

/**
 * 서버 사이드에서 사용하는 Date 타입의 createdAt을 갖는 커뮤니티 타입
 */
export interface CommunityWithDate extends Omit<CommunityBase, 'createdAt'> {
  createdAt: Date
}

/**
 * 커뮤니티 생성을 위한 입력 데이터 타입
 */
export interface CreateCommunityInput {
  name: string
  description?: string | null
  isPublic?: boolean
  region?: string | null
  subRegion?: string | null
  tagname?: string
  imageUrl?: string | null
}

/**
 * 커뮤니티 수정을 위한 입력 데이터 타입 (부분 업데이트)
 */
export interface UpdateCommunityInput {
  name?: string
  description?: string | null
  isPublic?: boolean
  region?: string | null
  subRegion?: string | null
  tagname?: string[]
  imageUrl?: string | null
}

/**
 * 커뮤니티 검색/필터링 옵션
 */
export interface CommunityFilterOptions {
  isPublic?: boolean
  search?: string
  createdAfter?: Date
  createdBefore?: Date
}

/**
 * API 응답 타입 - 단일 커뮤니티
 */
export interface CommunityResponse {
  success: boolean
  data?: Community
  error?: string
  message?: string
}

export interface CommunityInfo {
  clubId: string
  name: string
  description: string | null
  isPublic: boolean
  region?: string | null
  subRegion?: string | null
  imageUrl?: string | null
  createdAt: Date
  rounds?: {
    roundId: string
    roundNumber: number
    startDate: Date | null
    endDate: Date | null
    location: string | null
  }[]
}

/**
 * API 응답 타입 - 커뮤니티 리스트 (페이지네이션 포함)
 */
export interface CommunityListResponse {
  success: boolean
  data?: {
    data: CommunityBase[]
    count: number
    pagination: PaginationInfo
  }
  error?: string
  message?: string
}

/**
 * 커뮤니티 검색 where 조건 타입
 */
export interface CommunityWhereClause {
  deletedAt: null | { equals: null }
  isPublic?: boolean
  region?: string | null
  subRegion?: string | null
  name?: {
    contains: string
    mode: 'insensitive'
  }
  createdAt?:
    | {
        gte?: Date
        lte?: Date
      }
    | {
        gte: Date
        lte: Date
      }
  communityMembers?: {
    some: {
      userId: string
      deletedAt: null
    }
  }
}
