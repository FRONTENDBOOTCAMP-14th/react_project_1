import { useEffect, useState, useCallback } from 'react'
import type { Community, CreateCommunityInput, UpdateCommunityInput } from '@/lib/types/community'
import { API_ENDPOINTS, HTTP_HEADERS, MESSAGES } from '@/constants'

interface UseCommunityResult {
  community: Community | null
  loading: boolean
  error: string | null
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
 * 커뮤니티 데이터를 가져오는 커스텀 훅
 * @param id - 커뮤니티 ID
 * @returns 커뮤니티 데이터, 로딩 상태, 에러, 재조회 함수
 */
export const useCommunity = (id: string): UseCommunityResult => {
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommunity = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(API_ENDPOINTS.COMMUNITIES.BY_ID(id))
      const data = await response.json()

      if (data.success && data.data) {
        setCommunity(data.data)
      } else {
        setError(data.error || MESSAGES.ERROR.COMMUNITY_NOT_FOUND)
      }
    } catch (err) {
      console.error('Failed to fetch community:', err)
      setError(MESSAGES.ERROR.FAILED_TO_LOAD_COMMUNITY)
    } finally {
      setLoading(false)
    }
  }, [id])

  /**
   * 새로운 커뮤니티 생성
   * @param input - 커뮤니티 생성 데이터
   * @returns 생성 결과
   */
  const createCommunity = useCallback(async (input: CreateCommunityInput) => {
    try {
      const response = await fetch(API_ENDPOINTS.COMMUNITIES.BASE, {
        method: 'POST',
        headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
        body: JSON.stringify(input),
      })

      const result = await response.json()

      if (result.success) {
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_CREATE_COMMUNITY }
    } catch (err) {
      console.error('Failed to create community:', err)
      return { success: false, error: MESSAGES.ERROR.CREATING_COMMUNITY_ERROR }
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
        const response = await fetch(API_ENDPOINTS.COMMUNITIES.BY_ID(clubId), {
          method: 'PATCH',
          headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
          body: JSON.stringify(input),
        })

        const result = await response.json()

        if (result.success) {
          // 현재 조회 중인 커뮤니티면 상태 업데이트
          if (clubId === id) {
            await fetchCommunity()
          }
          return { success: true, data: result.data }
        }
        return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_UPDATE_COMMUNITY }
      } catch (err) {
        console.error('Failed to update community:', err)
        return { success: false, error: MESSAGES.ERROR.UPDATING_COMMUNITY_ERROR }
      }
    },
    [id, fetchCommunity]
  )

  /**
   * 커뮤니티 삭제 (소프트 삭제)
   * @param clubId - 삭제할 커뮤니티 ID
   * @returns 삭제 결과
   */
  const deleteCommunity = useCallback(async (clubId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.COMMUNITIES.DELETE_BY_ID(clubId), {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        return { success: true }
      }
      return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_DELETE_COMMUNITY }
    } catch (err) {
      console.error('Failed to delete community:', err)
      return { success: false, error: MESSAGES.ERROR.DELETING_COMMUNITY_ERROR }
    }
  }, [])

  useEffect(() => {
    fetchCommunity()
  }, [fetchCommunity])

  return {
    community,
    loading,
    error,
    refetch: fetchCommunity,
    createCommunity,
    updateCommunity,
    deleteCommunity,
  }
}
