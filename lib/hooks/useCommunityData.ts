import { useEffect, useState, useCallback } from 'react'
import type { Community } from '@/types/community'

interface UseCommunityDataResult {
  community: Community | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 커뮤니티 데이터를 가져오는 커스텀 훅
 * @param id - 커뮤니티 ID
 * @returns 커뮤니티 데이터, 로딩 상태, 에러, 재조회 함수
 */
export const useCommunityData = (id: string): UseCommunityDataResult => {
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommunity = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrl = `/api/communities/${id}`
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.ok && data.data) {
        setCommunity(data.data)
      } else {
        setError(data.error || '커뮤니티 정보를 불러올 수 없습니다.')
      }
    } catch (err) {
      console.error('Failed to fetch community:', err)
      setError('커뮤니티 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCommunity()
  }, [fetchCommunity])

  return { community, loading, error, refetch: fetchCommunity }
}
