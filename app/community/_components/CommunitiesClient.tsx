'use client'

import type { Community } from '@/lib/types/community'
import { MESSAGES } from '@/constants'
import CommunityCard from './CommunityCard'
import styles from '../community.module.css'

interface CommunitiesClientProps {
  communities: Community[]
}

export default function CommunitiesClient({ communities }: CommunitiesClientProps) {
  return (
    <>
      <div className={styles.header}>
        <h1>{MESSAGES.LABEL.ALL_COMMUNITIES}</h1>
        <p>{MESSAGES.LABEL.COMMUNITY_DESCRIPTION}</p>
      </div>

      <div className={styles.content}>
        {communities.length > 0 ? (
          <div className={styles.grid}>
            {communities.map(community => (
              <CommunityCard key={community.clubId} community={community} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>{MESSAGES.EMPTY.NO_REGISTERED_COMMUNITIES}</div>
        )}
      </div>
    </>
  )
}
