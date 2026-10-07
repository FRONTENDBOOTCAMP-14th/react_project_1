import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

/**
 * 활성 멤버 단건 조회 (ID 기준)
 */
export async function findMemberById(memberId: string) {
  return prisma.communityMember.findFirst({
    where: { id: memberId, deletedAt: null },
  })
}

/**
 * 사용자와 모임 ID 기준 활성 멤버 조회
 */
export async function findMemberByUserAndClub(userId: string, clubId: string) {
  return prisma.communityMember.findFirst({
    where: { userId, clubId, deletedAt: null },
  })
}

/**
 * 신규 멤버 레코드 생성
 */
export async function createMemberRecord(data: Prisma.CommunityMemberUncheckedCreateInput) {
  return prisma.communityMember.create({
    data,
  })
}

/**
 * 멤버 역할 업데이트
 */
export async function updateMemberRoleRecord(memberId: string, role: string) {
  return prisma.communityMember.update({
    where: { id: memberId, deletedAt: null },
    data: { role },
  })
}

/**
 * 멤버 소프트 삭제 (탈퇴/강퇴)
 */
export async function softDeleteMemberRecord(memberId: string) {
  return prisma.communityMember.update({
    where: { id: memberId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}

/**
 * 모임 내 활성 관리자 수 카운트
 */
export async function countAdminsInClub(clubId: string): Promise<number> {
  return prisma.communityMember.count({
    where: {
      clubId,
      role: 'admin',
      deletedAt: null,
    },
  })
}
