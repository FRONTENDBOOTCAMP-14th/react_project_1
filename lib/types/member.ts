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
