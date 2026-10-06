'use server'

import { getCurrentUserId, hasPermission } from '@/lib/auth'
import {
  canDeleteMember,
  validateMemberCreation,
  validateMemberRoleUpdate,
} from '@/lib/community/members.core'
import { prisma } from '@/lib/prisma'
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

      const club = await prisma.community.findFirst({
        where: { clubId, deletedAt: null },
        select: { clubId: true },
      })

      const existingMember = await prisma.communityMember.findFirst({
        where: {
          clubId,
          userId,
          deletedAt: null,
        },
      })

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

      const newMember = await prisma.communityMember.create({
        data: validation.value,
      })

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

      const existingMember = await prisma.communityMember.findFirst({
        where: { id: memberId, deletedAt: null },
        select: { clubId: true, userId: true },
      })

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

      const updatedMember = await prisma.communityMember.update({
        where: {
          id: memberId,
          deletedAt: null,
        },
        data: validation.value,
      })

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

      const existingMember = await prisma.communityMember.findFirst({
        where: { id: memberId, deletedAt: null },
        select: { clubId: true, userId: true, role: true },
      })

      const isSelf = existingMember?.userId === userId
      const hasAdminPermission = existingMember
        ? await hasPermission(userId, existingMember.clubId, 'admin')
        : false

      // 대상 멤버가 관리자일 때 다른 관리자가 남아있는지 확인
      let isSoleAdmin = false
      if (existingMember?.role === 'admin') {
        const adminCount = await prisma.communityMember.count({
          where: {
            clubId: existingMember.clubId,
            role: 'admin',
            deletedAt: null,
          },
        })
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

      await prisma.communityMember.update({
        where: {
          id: memberId,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })

      if (existingMember) {
        revalidatePath(`/community/${existingMember.clubId}`)
      }
    },
    { errorMessage: '멤버 삭제에 실패했습니다' }
  )
}
