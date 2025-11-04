import { useState, useEffect, useCallback } from 'react'
import { RoundService } from '../_services/roundService'
import type { Round, CreateRoundRequest } from '@/lib/types/round'

interface UseRoundsDataResult {
  rounds: Round[]
  loading: boolean
  error: string | null
  createRound: (data: CreateRoundRequest) => Promise<void>
  deleteRound: (roundId: string) => Promise<void>
  refetch: () => Promise<void>
}

/**
 * 라운드 데이터 관리 커스텀 훅
 * 데이터 페칭, 상태 관리, 에러 처리를 캡슐화합니다.
 */
export function useRoundsData(clubId: string): UseRoundsDataResult {
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRounds = useCallback(async () => {
    if (!clubId) return

    try {
      setLoading(true)
      setError(null)
      const data = await RoundService.getRounds(clubId)
      setRounds(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rounds')
      setRounds([])
    } finally {
      setLoading(false)
    }
  }, [clubId])

  const createRound = useCallback(
    async (data: CreateRoundRequest) => {
      if (!clubId) return

      try {
        const newRound = await RoundService.createRound({ ...data, clubId })
        setRounds(prev => [...prev, newRound])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create round')
        throw err
      }
    },
    [clubId]
  )

  const deleteRound = useCallback(async (roundId: string) => {
    try {
      await RoundService.deleteRound(roundId)
      setRounds(prev => prev.filter(round => round.roundId !== roundId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete round')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchRounds()
  }, [fetchRounds])

  return {
    rounds,
    loading,
    error,
    createRound,
    deleteRound,
    refetch: fetchRounds,
  }
}
