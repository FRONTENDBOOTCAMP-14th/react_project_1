/**
 * 공통 필드를 포함한 커뮤니티 기본 인터페이스
 */
export interface CommunityBase {
  clubId: string
  name: string
  description: string | null
  isPublic: boolean
  createdAt: string
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
}

/**
 * 커뮤니티 수정을 위한 입력 데이터 타입 (부분 업데이트)
 */
export interface UpdateCommunityInput {
  name?: string
  description?: string | null
  isPublic?: boolean
}
