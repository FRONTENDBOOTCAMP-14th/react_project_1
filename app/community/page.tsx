'use client'

import type { Community, CommunityListResponse } from '@/lib/types/community'
import { useEffect, useState } from 'react'
import CommunityCard from './_components/CommunityCard'
import styles from './community.module.css'

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 전체 커뮤니티 조회 (페이지네이션 없이 모든 커뮤니티)
        const response = await fetch('/api/communities?limit=100')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = (await response.json()) as CommunityListResponse

        if (result.success && result.data?.data) {
          setCommunities(result.data.data)
        } else {
          setError(result.error || '커뮤니티 데이터를 불러올 수 없습니다')
        }
      } catch (err) {
        console.error('Error fetching communities:', err)
        setError('커뮤니티 정보를 불러오는데 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommunities()
  }, [])

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>전체 커뮤니티</h1>
        <p>참여 가능한 모든 커뮤니티를 확인하세요</p>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : error ? (
          <div className={styles.error}>데이터를 불러올 수 없습니다: {error}</div>
        ) : communities.length > 0 ? (
          <div className={styles.grid}>
            {communities.map(community => (
              <CommunityCard key={community.clubId} community={community} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>등록된 커뮤니티가 없습니다</div>
        )}
      </div>
    </main>
  )
}
