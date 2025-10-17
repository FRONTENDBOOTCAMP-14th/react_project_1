/**
 * 사용자 권한 확인 유틸리티
 */

import prisma from '@/lib/prisma'

/**
 * 사용자가 특정 커뮤니티의 팀장인지 확인
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @returns 팀장 여부
 */
export async function checkIsTeamLeader(
  userId: string | null | undefined,
  clubId: string
): Promise<boolean> {
  if (!userId) return false

  try {
    const member = await prisma.communityMember.findFirst({
      where: {
        userId,
        clubId,
        deletedAt: null,
        role: 'admin',
      },
    })

    return !!member
  } catch (error) {
    console.error('Error checking team admin permission:', error)
    return false
  }
}

/**
 * 사용자가 특정 커뮤니티의 멤버인지 확인
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @returns 멤버 여부
 */
export async function checkIsMember(
  userId: string | null | undefined,
  clubId: string
): Promise<boolean> {
  if (!userId) return false

  try {
    const member = await prisma.communityMember.findFirst({
      where: {
        userId,
        clubId,
        deletedAt: null,
      },
    })

    return !!member
  } catch (error) {
    console.error('Error checking member status:', error)
    return false
  }
}
