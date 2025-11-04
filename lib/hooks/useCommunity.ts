import { API_ENDPOINTS, MESSAGES } from '@/constants'
import type { Community, CreateCommunityInput, UpdateCommunityInput } from '@/lib/types/community'
import { logger } from '@/lib/utils/logger'
import { deleter, fetcher, patcher, poster } from '@/lib/utils/swr'
import { useCallback } from 'react'
import useSWR, { mutate } from 'swr'

interface UseCommunityResult {
  community: Community | null
  loading: boolean
  error: Error | undefined
  refetch: () => Promise<void>
  createCommunity: (
    input: CreateCommunityInput
  ) => Promise<{ success: boolean; data?: Community; error?: string }>
  updateCommunity: (
    clubId: string,
    input: UpdateCommunityInput
  ) => Promise<{ success: boolean; data?: Community; error?: string }>
  deleteCommunity: (clubId: string) => Promise<{ success: boolean; error?: string }>
}

/**
 * 커뮤니티 데이터를 가져오는 SWR 기반 커스텀 훅
 * @param id - 커뮤니티 ID
 * @returns 커뮤니티 데이터, 로딩 상태, 에러, 재조회 함수
 */
export const useCommunity = (id: string): UseCommunityResult => {
  // URL 구성 - id가 없으면 요청하지 않음
  const url = id ? API_ENDPOINTS.COMMUNITIES.BY_ID(id) : null

  // SWR로 데이터 페칭
  const { data, error, isLoading } = useSWR<Community>(url, fetcher)

  // 재조회 함수
  const refetch = useCallback(async () => {
    if (url) {
      await mutate(url)
    }
  }, [url])

  /**
   * 새로운 커뮤니티 생성
   * @param input - 커뮤니티 생성 데이터
   * @returns 생성 결과
   */
  const createCommunity = useCallback(async (input: CreateCommunityInput) => {
    try {
      logger.debug('Creating community', { input })

      const data = await poster<Community>(API_ENDPOINTS.COMMUNITIES.BASE, input)

      logger.info('Community created successfully', { communityId: data.clubId })
      return { success: true, data }
    } catch (err) {
      logger.error('Failed to create community', { input }, err as Error)
      return {
        success: false,
        error: err instanceof Error ? err.message : MESSAGES.ERROR.CREATING_COMMUNITY_ERROR,
      }
    }
  }, [])

  /**
   * 커뮤니티 수정
   * @param clubId - 수정할 커뮤니티 ID
   * @param input - 수정할 데이터
   * @returns 수정 결과
   */
  const updateCommunity = useCallback(
    async (clubId: string, input: UpdateCommunityInput) => {
      try {
        logger.debug('Updating community', { clubId, input })

        const data = await patcher<Community>(API_ENDPOINTS.COMMUNITIES.BY_ID(clubId), input)

        logger.info('Community updated successfully', { clubId })

        // 현재 조회 중인 커뮤니티면 캐시 무효화 및 재조회
        if (clubId === id) {
          await refetch()
        }

        return { success: true, data }
      } catch (err) {
        logger.error('Failed to update community', { clubId, input }, err as Error)
        return {
          success: false,
          error: err instanceof Error ? err.message : MESSAGES.ERROR.UPDATING_COMMUNITY_ERROR,
        }
      }
    },
    [id, refetch]
  )

  /**
   * 커뮤니티 삭제 (소프트 삭제)
   * @param clubId - 삭제할 커뮤니티 ID
   * @returns 삭제 결과
   */
  const deleteCommunity = useCallback(async (clubId: string) => {
    try {
      logger.debug('Deleting community', { clubId })

      await deleter(API_ENDPOINTS.COMMUNITIES.BY_ID(clubId))

      logger.info('Community deleted successfully', { clubId })
      return { success: true }
    } catch (err) {
      logger.error('Failed to delete community', { clubId }, err as Error)
      return {
        success: false,
        error: err instanceof Error ? err.message : MESSAGES.ERROR.DELETING_COMMUNITY_ERROR,
      }
    }
  }, [])

  return {
    community: data || null,
    loading: isLoading,
    error: id && !url ? new Error('커뮤니티 ID가 필요합니다') : error,
    refetch,
    createCommunity,
    updateCommunity,
    deleteCommunity,
  }
}
