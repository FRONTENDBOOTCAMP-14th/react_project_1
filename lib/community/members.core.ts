import { err, ok, type Result } from '@/lib/errors/result'
import type { MemberRole } from '@/lib/types/member'

export const VALID_MEMBER_ROLES: readonly MemberRole[] = ['admin', 'member']

export interface ValidateMemberCreationInput {
  clubId: string
  userId: string
  role?: MemberRole
  clubExists: boolean
  isExistingMember: boolean
}

export interface ValidatedMemberCreationData {
  clubId: string
  userId: string
  role: MemberRole
}

export interface ValidateMemberRoleUpdateInput {
  hasAdminPermission: boolean
  memberExists: boolean
  targetRole?: MemberRole
}

export interface ValidatedMemberRoleUpdateData {
  role: MemberRole
}

export interface CanDeleteMemberInput {
  memberExists: boolean
  isSelf: boolean
  hasAdminPermission: boolean
  isSoleAdmin?: boolean
}

/**
 * 멤버 생성 요청 검증 및 기본값 설정
 */
export function validateMemberCreation(
  input: ValidateMemberCreationInput
): Result<ValidatedMemberCreationData, Error> {
  const role = input.role ?? 'member'

  if (!VALID_MEMBER_ROLES.includes(role)) {
    return err(new Error('유효하지 않은 역할입니다'))
  }

  if (!input.clubExists) {
    return err(new Error('커뮤니티를 찾을 수 없습니다'))
  }

  if (input.isExistingMember) {
    return err(new Error('이미 가입된 커뮤니티입니다'))
  }

  return ok({
    clubId: input.clubId,
    userId: input.userId,
    role,
  })
}

/**
 * 멤버 역할 수정 검증
 */
export function validateMemberRoleUpdate(
  input: ValidateMemberRoleUpdateInput
): Result<ValidatedMemberRoleUpdateData, Error> {
  if (!input.memberExists) {
    return err(new Error('멤버를 찾을 수 없습니다'))
  }

  if (!input.hasAdminPermission) {
    return err(new Error('팀장만 멤버 역할을 수정할 수 있습니다'))
  }

  if (!input.targetRole || !VALID_MEMBER_ROLES.includes(input.targetRole)) {
    return err(new Error('유효하지 않은 역할입니다'))
  }

  return ok({
    role: input.targetRole,
  })
}

/**
 * 멤버 삭제(탈퇴/강퇴) 권한 검증
 */
export function canDeleteMember(input: CanDeleteMemberInput): Result<true, Error> {
  if (!input.memberExists) {
    return err(new Error('멤버를 찾을 수 없습니다'))
  }

  if (input.isSoleAdmin) {
    return err(new Error('유일한 관리자는 탈퇴하거나 삭제될 수 없습니다'))
  }

  if (!input.isSelf && !input.hasAdminPermission) {
    return err(new Error('본인 또는 팀장만 멤버를 삭제할 수 있습니다'))
  }

  return ok(true)
}
