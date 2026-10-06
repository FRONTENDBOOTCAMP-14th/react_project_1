import type { PaginationInfo } from '@/lib/types'
import type { Community } from '@/lib/types/community'
import type { Round } from '@/lib/types/round'
import { useCallback } from 'react'
import { useAsyncData } from './useAsyncData'

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

interface UserCommunitiesState {
  subscribedCommunities: Community[]
  upcomingRounds: Round[]
  pagination: PaginationInfo | null
}

const INITIAL_USER_COMMUNITIES: UserCommunitiesState = {
  subscribedCommunities: [],
  upcomingRounds: [],
  pagination: null,
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
  const fetchUserCommunities = useCallback(async (): Promise<UserCommunitiesState> => {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다')
    }

    try {
      const params = new URLSearchParams()
      if (options.page) params.append('page', options.page.toString())
      if (options.limit) params.append('limit', options.limit.toString())

      const queryString = params.toString()
      const apiUrl = `/api/user/communities${queryString ? `?${queryString}` : ''}`

      const response = await fetch(apiUrl)
      const result = await response.json()

      if (result.success) {
        const data = result.data as UserCommunitiesResponse
        return {
          subscribedCommunities: data.subscribedCommunities || [],
          upcomingRounds: data.upcomingRounds || [],
          pagination: data.pagination || null,
        }
      }
      throw new Error(result.error || '커뮤니티 정보를 불러오는데 실패했습니다')
    } catch (err) {
      console.error('Failed to fetch user communities:', err)
      throw new Error('커뮤니티 정보를 불러오는데 실패했습니다')
    }
  }, [userId, options.page, options.limit])

  const { data, loading, error, refetch } = useAsyncData(fetchUserCommunities, {
    initialData: INITIAL_USER_COMMUNITIES,
    enabled: Boolean(userId),
  })

  return {
    subscribedCommunities: data.subscribedCommunities,
    upcomingRounds: data.upcomingRounds,
    pagination: data.pagination,
    loading,
    error,
    refetch,
  }
}
