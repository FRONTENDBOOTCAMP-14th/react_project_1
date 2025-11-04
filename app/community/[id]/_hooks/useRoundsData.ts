import { useState, useEffect, useCallback, useMemo } from 'react'
import { RoundService } from '../_services/roundService'
import type { Round, CreateRoundRequest } from '@/lib/types/round'
import { parseApiError } from '../_utils/errorHandling'
import { toast } from 'sonner'

interface UseRoundsDataResult {
  rounds: Round[]
  loading: boolean
  error: string | null
  createRound: (data: CreateRoundRequest) => Promise<void>
  deleteRound: (roundId: string) => Promise<void>
  refetch: () => Promise<void>
  isEmpty: boolean
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
    if (!clubId) {
      setRounds([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await RoundService.getRounds(clubId)
      setRounds(data)
    } catch (err) {
      const parsedError = parseApiError(err)
      const errorMessage = parsedError.message
      setError(errorMessage)
      setRounds([])
      toast.error(errorMessage)
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
        toast.success('새로운 회차가 생성되었습니다')
      } catch (err) {
        const parsedError = parseApiError(err)
        const errorMessage = parsedError.message
        setError(errorMessage)
        toast.error(errorMessage)
        throw parsedError
      }
    },
    [clubId]
  )

  const deleteRound = useCallback(async (roundId: string) => {
    try {
      await RoundService.deleteRound(roundId)
      setRounds(prev => prev.filter(round => round.roundId !== roundId))
      toast.success('회차가 삭제되었습니다')
    } catch (err) {
      const parsedError = parseApiError(err)
      const errorMessage = parsedError.message
      setError(errorMessage)
      toast.error(errorMessage)
      throw parsedError
    }
  }, [])

  useEffect(() => {
    fetchRounds()
  }, [fetchRounds])

  const isEmpty = useMemo(() => rounds.length === 0, [rounds.length])

  return {
    rounds,
    loading,
    error,
    createRound,
    deleteRound,
    refetch: fetchRounds,
    isEmpty,
  }
}
