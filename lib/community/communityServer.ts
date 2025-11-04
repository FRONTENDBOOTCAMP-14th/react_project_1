import prisma from '@/lib/prisma'
import type { Community } from '@/lib/types/community'
import type { Round } from '@/lib/types/round'

export interface CommunityDetail extends Community {
  rounds: Round[]
  notifications: Array<{
    notificationId: string
    title: string
    content: string | null
    isPinned: boolean
    createdAt: Date
  }>
  memberCount: number
}

/**
 * 서버 컴포넌트용 커뮤니티 상세 정보 조회
 * - 한 번의 쿼리로 모든 관련 데이터 조회
 * - Soft delete 필터 적용
 */
export async function getCommunityDetail(clubId: string): Promise<CommunityDetail | null> {
  try {
    const community = await prisma.community.findFirst({
      where: { clubId, deletedAt: null },
      select: {
        clubId: true,
        name: true,
        description: true,
        isPublic: true,
        region: true,
        subRegion: true,
        imageUrl: true,
        tagname: true,
        createdAt: true,
        updatedAt: true,
        rounds: {
          select: {
            roundId: true,
            clubId: true,
            roundNumber: true,
            startDate: true,
            endDate: true,
            location: true,
            createdAt: true,
            updatedAt: true,
          },
          where: {
            deletedAt: null,
            startDate: {
              gte: new Date(),
            },
          },
          orderBy: { roundNumber: 'desc' },
        },
        notifications: {
          select: {
            notificationId: true,
            title: true,
            content: true,
            isPinned: true,
            createdAt: true,
          },
          where: { deletedAt: null },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          take: 5, // 최근 5개만
        },
        communityMembers: {
          select: { id: true },
          where: { deletedAt: null },
        },
      },
    })

    if (!community) {
      return null
    }

    // memberCount 추가
    const communityDetail: CommunityDetail = {
      ...community,
      memberCount: community.communityMembers.length,
    }

    // communityMembers는 필요 없으므로 제거
    delete (communityDetail as CommunityDetail & { communityMembers: unknown }).communityMembers

    return communityDetail
  } catch (error) {
    console.error('커뮤니티 상세 정보 조회 실패:', error)
    return null
  }
}
