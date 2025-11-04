import type { PaginationInfo } from '@/lib/types'
import type { Community } from '@/lib/types/community'
import type { Round } from '@/lib/types/round'
import { fetcher } from '@/lib/utils/swr'
import { useCallback } from 'react'
import useSWR, { mutate } from 'swr'

interface UseUserCommunitiesResult {
  subscribedCommunities: Community[]
  upcomingRounds: Round[]
  pagination: PaginationInfo | null
  loading: boolean
  error: Error | undefined
  refetch: () => Promise<void>
}

interface UserCommunitiesResponse {
  subscribedCommunities: Community[]
  upcomingRounds: Round[]
  pagination: PaginationInfo
}

/**
 * 사용자가 구독한 커뮤니티와 다가오는 라운드들을 가져오는 SWR 기반 커스텀 훅
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
 * if (error) return <div>Error: {error.message}</div>
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
  // URL 구성
  const constructUrl = useCallback(() => {
    if (!userId) return null

    const params = new URLSearchParams()
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())

    const queryString = params.toString()
    return `/api/user/communities${queryString ? `?${queryString}` : ''}`
  }, [userId, options.page, options.limit])

  const url = constructUrl()

  // SWR로 데이터 페칭
  const { data: responseData, error, isLoading } = useSWR<UserCommunitiesResponse>(url, fetcher)

  // 데이터 추출
  const subscribedCommunities = responseData?.subscribedCommunities || []
  const upcomingRounds = responseData?.upcomingRounds || []
  const pagination = responseData?.pagination || null

  // 재조회 함수
  const refetch = useCallback(async () => {
    if (url) {
      await mutate(url)
    }
  }, [url])

  return {
    subscribedCommunities,
    upcomingRounds,
    pagination,
    loading: isLoading,
    error: userId && !url ? new Error('사용자 ID가 필요합니다') : error,
    refetch,
  }
}
