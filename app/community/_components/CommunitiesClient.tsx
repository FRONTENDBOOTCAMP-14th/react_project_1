'use client'

import type { Community } from '@/lib/types/community'
import CommunityCard from './CommunityCard'
import styles from '../community.module.css'

interface CommunitiesClientProps {
  communities: Community[]
}

export default function CommunitiesClient({ communities }: CommunitiesClientProps) {
  return (
    <>
      <div className={styles.header}>
        <h1>전체 커뮤니티</h1>
        <p>참여 가능한 모든 커뮤니티를 확인하세요</p>
      </div>

      <div className={styles.content}>
        {communities.length > 0 ? (
          <div className={styles.grid}>
            {communities.map(community => (
              <CommunityCard key={community.clubId} community={community} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>등록된 커뮤니티가 없습니다</div>
        )}
      </div>
    </>
  )
}
