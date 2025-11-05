'use server'

import { getCurrentUserId, hasPermission } from '@/lib/auth'
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

      const { clubId, role = 'member' } = data

      // 역할 검증
      const validRoles = ['admin', 'member']
      if (!validRoles.includes(role)) {
        throw new Error('유효하지 않은 역할입니다')
      }

      // 커뮤니티 존재 확인
      const club = await prisma.community.findFirst({
        where: { clubId, deletedAt: null },
        select: { clubId: true },
      })

      assertExists(club, '커뮤니티를 찾을 수 없습니다')

      // 이미 멤버인지 확인
      const existingMember = await prisma.communityMember.findFirst({
        where: {
          clubId,
          userId,
          deletedAt: null,
        },
      })

      if (existingMember) {
        throw new Error('이미 가입된 커뮤니티입니다')
      }

      const newMember = await prisma.communityMember.create({
        data: {
          clubId,
          userId,
          role,
        },
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

      // 멤버 정보 조회
      const existingMember = await prisma.communityMember.findFirst({
        where: { id: memberId, deletedAt: null },
        select: { clubId: true, userId: true },
      })

      assertExists(existingMember, '멤버를 찾을 수 없습니다')

      // 팀장 권한 확인
      const hasAdminPermission = await hasPermission(userId, existingMember.clubId, 'admin')
      if (!hasAdminPermission) {
        throw new Error('팀장만 멤버 역할을 수정할 수 있습니다')
      }

      // 역할 검증
      if (data.role) {
        const validRoles = ['admin', 'member']
        if (!validRoles.includes(data.role)) {
          throw new Error('유효하지 않은 역할입니다')
        }
      }

      const updatedMember = await prisma.communityMember.update({
        where: {
          id: memberId,
          deletedAt: null,
        },
        data: {
          ...(data.role && { role: data.role }),
        },
      })

      revalidatePath(`/community/${existingMember.clubId}`)
      return updatedMember
    },
    { errorMessage: '멤버 역할 수정에 실패했습니다' }
  )
}

/**
 * Server Action: 멤버 삭제 (커뮤니티 탈퇴)
 */
export async function deleteMemberAction(memberId: string): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // 멤버 정보 조회
      const existingMember = await prisma.communityMember.findFirst({
        where: { id: memberId, deletedAt: null },
        select: { clubId: true, userId: true },
      })

      assertExists(existingMember, '멤버를 찾을 수 없습니다')

      // 권한 확인: 본인 또는 팀장
      const isSelf = existingMember.userId === userId
      const hasAdminPermission = await hasPermission(userId, existingMember.clubId, 'admin')
      if (!isSelf && !hasAdminPermission) {
        throw new Error('본인 또는 팀장만 멤버를 삭제할 수 있습니다')
      }

      // 소프트 삭제
      await prisma.communityMember.update({
        where: {
          id: memberId,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })

      revalidatePath(`/community/${existingMember.clubId}`)
    },
    { errorMessage: '멤버 삭제에 실패했습니다' }
  )
}
