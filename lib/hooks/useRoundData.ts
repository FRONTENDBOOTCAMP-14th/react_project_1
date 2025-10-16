import { useEffect, useState, useCallback } from 'react'
import type { Round } from '@/types/round'

interface UseRoundDataResult {
  currentRound: Round | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 현재 라운드 데이터를 가져오는 커스텀 훅
 * @param clubId - 클럽 ID
 * @returns 현재 라운드 데이터, 로딩 상태, 에러, 재조회 함수
 */
export const useRoundData = (clubId: string): UseRoundDataResult => {
  const [currentRound, setCurrentRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRound = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/rounds?clubId=${clubId}`)
      const data = await response.json()

      if (data.success && data.data && data.data.length > 0) {
        setCurrentRound(data.data[0])
      } else {
        setCurrentRound(null)
      }
    } catch (err) {
      console.error('Failed to fetch round:', err)
      setError('라운드 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [clubId])

  useEffect(() => {
    fetchRound()
  }, [fetchRound])

  return { currentRound, loading, error, refetch: fetchRound }
}
