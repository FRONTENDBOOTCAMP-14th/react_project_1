/**
 * 사용자 권한 확인 유틸리티
 */

import prisma from '@/lib/prisma'

export interface CommunityMembership {
  id: string
  role: string
  joinedAt: Date
}

/**
 * 커뮤니티 멤버십 상세 정보 조회 (권한 검사 공통 SSOT)
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @param role - 특정 역할 필터 (선택)
 * @returns 멤버십 정보 또는 null
 */
export async function getCommunityMembership(
  userId: string | null | undefined,
  clubId: string,
  role?: string
): Promise<CommunityMembership | null> {
  if (!userId || !clubId) return null

  try {
    return await prisma.communityMember.findFirst({
      where: {
        userId,
        clubId,
        deletedAt: null,
        ...(role && { role }),
      },
      select: {
        id: true,
        role: true,
        joinedAt: true,
      },
    })
  } catch (error) {
    console.error('Error finding community membership:', error)
    return null
  }
}

/**
 * 사용자가 특정 커뮤니티의 팀장(admin)인지 확인
 * @param userId - 사용자 ID
 * @param clubId - 커뮤니티 ID
 * @returns 팀장 여부
 */
export async function checkIsAdmin(
  userId: string | null | undefined,
  clubId: string
): Promise<boolean> {
  if (!userId || !clubId) return false

  try {
    const membership = await getCommunityMembership(userId, clubId, 'admin')
    return !!membership
  } catch (error) {
    console.error('Error checking team admin permission:', error)
    return false
  }
}

/** 하위 호환성을 위한 별칭 */
export const checkisAdmin = checkIsAdmin

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
    const membership = await getCommunityMembership(userId, clubId)
    return !!membership
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
    const member = await getCommunityMembership(userId, clubId)

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
