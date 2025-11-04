import { useState, useEffect, useCallback } from 'react'
import { CommunityService } from '../_services/communityService'
import type { Community, UpdateCommunityInput } from '@/lib/types/community'

interface UseCommunityDataResult {
  community: Community | null
  loading: boolean
  error: string | null
  updateCommunity: (data: UpdateCommunityInput) => Promise<void>
  refetch: () => Promise<void>
}

/**
 * 커뮤니티 데이터 관리 커스텀 훅
 * 데이터 페칭, 상태 관리, 에러 처리를 캡슐화합니다.
 */
export function useCommunityData(clubId: string): UseCommunityDataResult {
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommunity = useCallback(async () => {
    if (!clubId) return

    try {
      setLoading(true)
      setError(null)
      const data = await CommunityService.getCommunity(clubId)
      setCommunity(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community')
    } finally {
      setLoading(false)
    }
  }, [clubId])

  const updateCommunity = useCallback(
    async (data: UpdateCommunityInput) => {
      if (!clubId) return

      try {
        const updatedCommunity = await CommunityService.updateCommunity(clubId, data)
        setCommunity(updatedCommunity)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update community')
        throw err
      }
    },
    [clubId]
  )

  useEffect(() => {
    fetchCommunity()
  }, [fetchCommunity])

  return {
    community,
    loading,
    error,
    updateCommunity,
    refetch: fetchCommunity,
  }
}
