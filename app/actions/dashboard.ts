'use server'

import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CommunityInfo } from '@/lib/types/community'
import {
  assertExists,
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

      // 멤버 정보 조회
      const existingMember = await prisma.communityMember.findFirst({
        where: {
          clubId,
          userId,
          deletedAt: null,
        },
      })

      if (!existingMember) {
        throw new Error('멤버를 찾을 수 없습니다')
      }

      // 관리자인 경우 다른 관리자가 있는지 확인
      if (existingMember.role === 'admin') {
        const otherAdmins = await prisma.communityMember.findMany({
          where: {
            clubId,
            role: 'admin',
            userId: { not: userId },
            deletedAt: null,
          },
        })

        if (otherAdmins.length === 0) {
          throw new Error('팀장은 커뮤니티에 다른 팀장이 있는 경우에만 탈퇴할 수 있습니다')
        }
      }

      // 소프트 삭제
      await prisma.communityMember.update({
        where: {
          id: existingMember.id,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      })

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
