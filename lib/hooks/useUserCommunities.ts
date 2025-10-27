import type { Community } from '@/lib/types/community'
import type { Round } from '@/lib/types/round'
import type { PaginationInfo } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'

interface UseUserCommunitiesResult {
  subscribedCommunities: Community[]
  upcomingRounds: Round[]
  pagination: PaginationInfo | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UserCommunitiesResponse {
  subscribedCommunities: Community[]
  upcomingRounds: Round[]
  pagination: PaginationInfo
}

/**
 * 사용자가 구독한 커뮤니티와 다가오는 라운드들을 가져오는 커스텀 훅
 *
 * @param userId - 사용자 ID
 * @param options - 페이지네이션 옵션
 * @returns 구독 커뮤니티 목록, 다가오는 라운드 목록, 로딩 상태, 에러, 재조회 함수
 *
 * @example
 * ```tsx
 * const { subscribedCommunities, upcomingRounds, loading, error, refetch } = useUserCommunities('user-123')
 *
 * if (loading) return <div>Loading...</div>
 * if (error) return <div>Error: {error}</div>
 *
 * return (
 *   <div>
 *     <h2>내 커뮤니티</h2>
 *     {subscribedCommunities.map(community => (
 *       <div key={community.clubId}>{community.name}</div>
 *     ))}
 *
 *     <h2>다가오는 라운드</h2>
 *     {upcomingRounds.map(round => (
 *       <div key={round.roundId}>
 *         Round {round.roundNumber} - {round.startDate}
 *       </div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export const useUserCommunities = (
  userId: string,
  options: {
    page?: number
    limit?: number
  } = {}
): UseUserCommunitiesResult => {
  const [subscribedCommunities, setSubscribedCommunities] = useState<Community[]>([])
  const [upcomingRounds, setUpcomingRounds] = useState<Round[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserCommunities = useCallback(async () => {
    if (!userId) {
      setSubscribedCommunities([])
      setUpcomingRounds([])
      setPagination(null)
      setLoading(false)
      setError('사용자 ID가 필요합니다')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 쿼리 파라미터 구성
      const params = new URLSearchParams()
      if (options.page) params.append('page', options.page.toString())
      if (options.limit) params.append('limit', options.limit.toString())

      const queryString = params.toString()
      const apiUrl = `/api/user/communities${queryString ? `?${queryString}` : ''}`

      // API 호출로 변경
      const response = await fetch(apiUrl)
      const result = await response.json()

      if (result.success) {
        const data = result.data as UserCommunitiesResponse
        setSubscribedCommunities(data.subscribedCommunities)
        setUpcomingRounds(data.upcomingRounds)
        setPagination(data.pagination)
      } else {
        setSubscribedCommunities([])
        setUpcomingRounds([])
        setPagination(null)
        setError(result.error || '커뮤니티 정보를 불러오는데 실패했습니다')
      }
    } catch (err) {
      console.error('Failed to fetch user communities:', err)
      setError('커뮤니티 정보를 불러오는데 실패했습니다')
      setSubscribedCommunities([])
      setUpcomingRounds([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [userId, options.page, options.limit])

  useEffect(() => {
    fetchUserCommunities()
  }, [fetchUserCommunities])

  return {
    subscribedCommunities,
    upcomingRounds,
    pagination,
    loading,
    error,
    refetch: fetchUserCommunities,
  }
}
