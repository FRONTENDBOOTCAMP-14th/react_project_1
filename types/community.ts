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
