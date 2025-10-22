import CommunityCard from '../_components/CommunityCard'
import { ErrorState } from '@/components/common'
import { API_ENDPOINTS } from '@/constants'
import type { CommunityListResponse } from '@/lib/types'
import styles from './page.module.css'

/**
 * 메인 페이지 - 공개 커뮤니티 목록 표시
 */
export default async function MainPage() {
  try {
    // API_ENDPOINTS 상수 사용하여 공개 커뮤니티 목록 조회
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const endpoint = `${API_ENDPOINTS.COMMUNITIES.BASE}?isPublic=true&limit=20`

    const response = await fetch(`${baseUrl}${endpoint}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result: CommunityListResponse = await response.json()

    // API 응답 성공 여부 확인
    if (!result.success || !result.data) {
      throw new Error(result.error || '커뮤니티 목록을 불러오는데 실패했습니다.')
    }

    const communities = result.data

    // 커뮤니티가 없는 경우
    if (communities.length === 0) {
      return (
        <main className={styles.container}>
          <section className={styles.emptySection}>
            <p>공개된 커뮤니티가 없습니다.</p>
          </section>
        </main>
      )
    }

    return (
      <main className={styles.container}>
        <section className={styles.communityList}>
          <h1 className={styles.title}>공개 커뮤니티</h1>
          <div className={styles.cardGrid}>
            {communities.map(community => (
              <CommunityCard key={community.clubId} community={community} />
            ))}
          </div>
        </section>
      </main>
    )
  } catch (error) {
    console.error('Failed to fetch communities:', error)
    return (
      <main className={styles.container}>
        <ErrorState
          message="커뮤니티 목록을 불러오는데 실패했습니다."
          onRetry={() => window.location.reload()}
        />
      </main>
    )
  }
}
