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
 * Server Action: 멤버 추가 (커뮤니티 가입 - Imperative Shell)
 */
export async function createMemberAction(data: CreateMemberRequest): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      const { clubId, role = 'member' } = data

      // 1. I/O: 커뮤니티 존재 확인
      const club = await prisma.community.findFirst({
        where: { clubId, deletedAt: null },
        select: { clubId: true },
      })

      // 2. I/O: 이미 멤버인지 확인
      const existingMember = await prisma.communityMember.findFirst({
        where: {
          clubId,
          userId,
          deletedAt: null,
        },
      })

      // 3. Functional Core: 가입 요청 데이터 유효성 검증
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

      // 4. I/O: 멤버 생성
      const newMember = await prisma.communityMember.create({
        data: validation.value,
      })

      // 5. Side Effects: 캐시 무효화
      revalidatePath(`/community/${clubId}`)
      return newMember
    },
    { errorMessage: '멤버 추가에 실패했습니다' }
  )
}

/**
 * Server Action: 멤버 역할 수정 (Imperative Shell)
 */
export async function updateMemberAction(
  memberId: string,
  data: UpdateMemberRequest
): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // 1. I/O: 멤버 정보 조회
      const existingMember = await prisma.communityMember.findFirst({
        where: { id: memberId, deletedAt: null },
        select: { clubId: true, userId: true },
      })

      // 2. I/O: 팀장 권한 확인
      const hasAdminPermission = existingMember
        ? await hasPermission(userId, existingMember.clubId, 'admin')
        : false

      // 3. Functional Core: 역할 수정 검증
      const validation = validateMemberRoleUpdate({
        hasAdminPermission,
        memberExists: Boolean(existingMember),
        targetRole: data.role,
      })
      if (validation.isErr()) {
        throw validation.error
      }

      // 4. I/O: 멤버 업데이트
      const updatedMember = await prisma.communityMember.update({
        where: {
          id: memberId,
          deletedAt: null,
        },
        data: validation.value,
      })

      // 5. Side Effects: 캐시 무효화
      if (existingMember) {
        revalidatePath(`/community/${existingMember.clubId}`)
      }
      return updatedMember
    },
    { errorMessage: '멤버 역할 수정에 실패했습니다' }
  )
}

/**
 * Server Action: 멤버 삭제 (커뮤니티 탈퇴/강퇴 - Imperative Shell)
 */
export async function deleteMemberAction(memberId: string): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // 1. I/O: 멤버 정보 조회
      const existingMember = await prisma.communityMember.findFirst({
        where: { id: memberId, deletedAt: null },
        select: { clubId: true, userId: true },
      })

      // 2. I/O: 권한 확인 (본인 또는 팀장)
      const isSelf = existingMember?.userId === userId
      const hasAdminPermission = existingMember
        ? await hasPermission(userId, existingMember.clubId, 'admin')
        : false

      // 3. Functional Core: 삭제 자격 검증
      const validation = canDeleteMember({
        memberExists: Boolean(existingMember),
        isSelf,
        hasAdminPermission,
      })
      if (validation.isErr()) {
        throw validation.error
      }

      // 4. I/O: 소프트 삭제 처리
      await prisma.communityMember.update({
        where: {
          id: memberId,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })

      // 5. Side Effects: 캐시 무효화
      if (existingMember) {
        revalidatePath(`/community/${existingMember.clubId}`)
      }
    },
    { errorMessage: '멤버 삭제에 실패했습니다' }
  )
}
