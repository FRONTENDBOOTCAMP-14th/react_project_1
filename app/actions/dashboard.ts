'use server'

import { getCurrentUserId } from '@/lib/auth'
import { canDeleteMember } from '@/lib/community/members.core'
import {
  countAdminsInClub,
  findMemberByUserAndClub,
  softDeleteMemberRecord,
} from '@/lib/community/members.server'
import { prisma } from '@/lib/prisma'
import type { CommunityInfo } from '@/lib/types/community'
import {
  assertExists,
  ServerActionError,
  type ServerActionResponse,
  withServerAction,
} from '@/lib/utils/serverActions'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: 사용자의 커뮤니티 탈퇴
 */
export async function leaveCommunityAction(clubId: string): Promise<ServerActionResponse> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      // 멤버 정보 조회 (Server I/O)
      const existingMember = await findMemberByUserAndClub(userId, clubId)
      assertExists(existingMember, '멤버를 찾을 수 없습니다')

      // 관리자인 경우 다른 관리자가 있는지 확인
      let isSoleAdmin = false
      if (existingMember.role === 'admin') {
        const adminCount = await countAdminsInClub(clubId)
        isSoleAdmin = adminCount <= 1
      }

      // Core: 탈퇴 불변식 판별 (INV-M02)
      const validation = canDeleteMember({
        memberExists: Boolean(existingMember),
        isSelf: true,
        hasAdminPermission: false,
        isSoleAdmin,
      })
      if (validation.isErr()) {
        throw new ServerActionError(validation.error.message)
      }

      // Server I/O: 소프트 삭제
      await softDeleteMemberRecord(existingMember.id)

      revalidatePath('/dashboard')
    },
    { errorMessage: '커뮤니티 탈퇴에 실패했습니다' }
  )
}

/**
 * Server Action: 사용자의 구독 커뮤니티 목록 조회
 */
export async function getUserCommunitiesAction(): Promise<ServerActionResponse<CommunityInfo[]>> {
  return withServerAction(
    async () => {
      const userId = await getCurrentUserId()
      assertExists(userId, '인증이 필요합니다')

      const communities = await prisma.community.findMany({
        where: {
          deletedAt: null,
          communityMembers: {
            some: {
              userId,
              deletedAt: null,
            },
          },
        },
        select: {
          clubId: true,
          name: true,
          description: true,
          isPublic: true,
          region: true,
          subRegion: true,
          tagname: true,
          createdAt: true,
          imageUrl: true,
          communityMembers: {
            select: {
              role: true,
              userId: true,
            },
            where: {
              userId,
              deletedAt: null,
            },
          },
          rounds: {
            select: {
              roundId: true,
              roundNumber: true,
              startDate: true,
              endDate: true,
              location: true,
            },
            where: {
              deletedAt: null,
              startDate: {
                gte: new Date(),
              },
            },
            orderBy: { roundNumber: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return communities
    },
    { errorMessage: '커뮤니티 목록 조회에 실패했습니다' }
  )
}
