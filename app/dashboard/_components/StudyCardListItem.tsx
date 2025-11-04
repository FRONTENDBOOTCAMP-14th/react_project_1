'use client'

import { CommunityCard } from './CommunityCard'
import { DashboardLayout } from './DashboardLayout'
import { MESSAGES } from '@/constants'
import { useCommunityActions } from './useCommunityActions'
import { memo } from 'react'
import type { CommunityInfo } from '@/lib/types/community'

interface StudyCardListProps {
  communities: CommunityInfo[]
  username: string
}

function StudyCardList({ communities, username }: StudyCardListProps) {
  const { confirmLeaveCommunity } = useCommunityActions()

  const handleLeaveCommunity = async (clubId: string) => {
    const community = communities.find(c => c.clubId === clubId)
    if (!community) return

    try {
      await confirmLeaveCommunity(clubId, community.name)
    } catch (_error) {
      // 사용자가 취소한 경우나 오류가 발생한 경우
      // confirmLeaveCommunity 함수에서 이미 toast 처리
    }
  }

  return (
    <DashboardLayout
      title={MESSAGES.DASHBOARD.STUDY_LIST_TITLE(username)}
      emptyMessage={MESSAGES.DASHBOARD.EMPTY_COMMUNITIES}
      isEmpty={communities.length === 0}
    >
      {communities.map(community => {
        const currentMember = community.communityMembers?.[0]
        const isAdmin = currentMember?.role === 'admin'

        return (
          <CommunityCard
            key={community.clubId}
            clubId={community.clubId}
            name={community.name}
            description={community.description || ''}
            region={community.region || ''}
            subRegion={community.subRegion || ''}
            imageUrl={community.imageUrl || ''}
            isAdmin={isAdmin}
            onLeave={handleLeaveCommunity}
          />
        )
      })}
    </DashboardLayout>
  )
}

export default memo(StudyCardList)
