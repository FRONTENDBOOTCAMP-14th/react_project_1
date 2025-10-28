/**
 * CommunityMember 관련 타입 정의
 */

/**
 * 멤버 역할 타입
 */
export type MemberRole = 'admin' | 'member'

/**
 * 멤버 생성 요청
 */
export interface CreateMemberRequest {
  clubId: string
  userId: string
  role?: MemberRole
}

/**
 * 멤버 수정 요청
 */
export interface UpdateMemberRequest {
  role?: MemberRole
}

/**
 * 멤버 조회 파라미터
 */
export interface GetMembersParams {
  clubId?: string
  userId?: string
  role?: MemberRole
  page?: number
  limit?: number
}

export interface Member {
  id: string
  clubId: string
  userId: string
  role: string
  joinedAt: string
  user: {
    userId: string
    username: string
    email: string
    nickname: string | null
  }
}

// Prisma 반환 타입
export interface PrismaMember {
  id: string
  clubId: string
  userId: string
  role: string
  joinedAt: Date
  user: {
    userId: string
    username: string
    email: string | null
    nickname: string | null
  }
  community: {
    clubId: string
    name: string
    description: string | null
  }
}
