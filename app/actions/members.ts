'use server'

import { getCurrentUserId, hasPermission } from '@/lib/auth'
import { findCommunityById } from '@/lib/community/community.server'
import {
  canDeleteMember,
  validateMemberCreation,
  validateMemberRoleUpdate,
} from '@/lib/community/members.core'
import {
  countAdminsInClub,
  createMemberRecord,
  findMemberById,
  findMemberByUserAndClub,
  softDeleteMemberRecord,
  updateMemberRoleRecord,
} from '@/lib/community/members.server'
import type { CreateMemberRequest, UpdateMemberRequest } from '@/lib/types/member'
import {
  assertExists,
  type ServerActionResponse,
  withServerAction,
} from '@/lib/utils/serverActions'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: 멤버 추가 (커뮤니티 가입)
 */
export async function createMemberAction(data: CreateMemberRequest): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      const { clubId } = data
      const role = 'member'

      const [club, existingMember] = await Promise.all([
        findCommunityById(clubId),
        findMemberByUserAndClub(userId, clubId),
      ])

      const validation = validateMemberCreation({
        clubId,
        userId,
        role,
        clubExists: Boolean(club),
        isExistingMember: Boolean(existingMember),
      })
      if (validation.isErr()) {
        throw validation.error
      }

      const newMember = await createMemberRecord(validation.value)

      revalidatePath(`/community/${clubId}`)
      return newMember
    },
    { errorMessage: '멤버 추가에 실패했습니다' }
  )
}

/**
 * Server Action: 멤버 역할 수정
 */
export async function updateMemberAction(
  memberId: string,
  data: UpdateMemberRequest
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      const existingMember = await findMemberById(memberId)

      const hasAdminPermission = existingMember
        ? await hasPermission(userId, existingMember.clubId, 'admin')
        : false

      const validation = validateMemberRoleUpdate({
        hasAdminPermission,
        memberExists: Boolean(existingMember),
        targetRole: data.role,
      })
      if (validation.isErr()) {
        throw validation.error
      }

      const updatedMember = await updateMemberRoleRecord(memberId, validation.value.role)

      if (existingMember) {
        revalidatePath(`/community/${existingMember.clubId}`)
      }
      return updatedMember
    },
    { errorMessage: '멤버 역할 수정에 실패했습니다' }
  )
}

/**
 * Server Action: 멤버 삭제 (커뮤니티 탈퇴/강퇴)
 */
export async function deleteMemberAction(memberId: string): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      const existingMember = await findMemberById(memberId)

      const isSelf = existingMember?.userId === userId
      const hasAdminPermission = existingMember
        ? await hasPermission(userId, existingMember.clubId, 'admin')
        : false

      // 대상 멤버가 관리자일 때 다른 관리자가 남아있는지 확인
      let isSoleAdmin = false
      if (existingMember?.role === 'admin') {
        const adminCount = await countAdminsInClub(existingMember.clubId)
        isSoleAdmin = adminCount <= 1
      }

      const validation = canDeleteMember({
        memberExists: Boolean(existingMember),
        isSelf,
        hasAdminPermission,
        isSoleAdmin,
      })
      if (validation.isErr()) {
        throw validation.error
      }

      await softDeleteMemberRecord(memberId)

      if (existingMember) {
        revalidatePath(`/community/${existingMember.clubId}`)
      }
    },
    { errorMessage: '멤버 삭제에 실패했습니다' }
  )
}
