import { fetchRecommendedCommunities } from '@/app/api/communities/communities'
import CommunityCard from './CommunityCard'
import styles from './RecommendedStudies.module.css'

export default async function RecommendedStudies() {
  const communities = await fetchRecommendedCommunities(10, true)

  return (
    <div className={styles['footer-container']}>
      <h2>추천 스터디</h2>
      <div className={styles['recommend-container']}>
        {Array.isArray(communities) && communities.length > 0 ? (
          communities.map(community => (
            <CommunityCard key={community.clubId} community={community} />
          ))
        ) : (
          <div className={styles['recommend-item']}>추천 스터디가 없습니다</div>
        )}
      </div>
    </div>
  )
}
