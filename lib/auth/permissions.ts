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
export async function checkisAdmin(
  userId: string | null | undefined,
  clubId: string
): Promise<boolean> {
  if (!userId || !clubId) return false

  try {
    return (
      (await prisma.communityMember.count({
        where: {
          userId,
          clubId,
          role: 'admin',
          deletedAt: null,
        },
      })) > 0
    )
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
  if (!userId || !clubId) return false

  try {
    return (
      (await prisma.communityMember.count({
        where: {
          userId,
          clubId,
          deletedAt: null,
        },
      })) > 0
    )
  } catch (error) {
    console.error('Error checking member permission:', error)
    return false
  }
}

/**
 * 한 번의 쿼리로 멤버 여부와 팀장 여부 확인
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @returns { isMember: boolean, isAdmin: boolean }
 */
export async function checkMembershipAndRole(
  userId: string | null | undefined,
  clubId: string
): Promise<{ isMember: boolean; isAdmin: boolean }> {
  if (!userId || !clubId) {
    return { isMember: false, isAdmin: false }
  }

  try {
    const member = await prisma.communityMember.findFirst({
      where: {
        userId,
        clubId,
        deletedAt: null,
      },
      select: {
        role: true,
      },
    })

    if (!member) {
      return { isMember: false, isAdmin: false }
    }

    return {
      isMember: true,
      isAdmin: member.role === 'admin',
    }
  } catch (error) {
    console.error('Error checking membership and role:', error)
    return { isMember: false, isAdmin: false }
  }
}
