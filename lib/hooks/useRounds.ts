import { useEffect, useState, useCallback } from 'react'
import type { Round, CreateRoundRequest, UpdateRoundRequest } from '@/lib/types/round'
import { API_ENDPOINTS, HTTP_HEADERS, MESSAGES } from '@/constants'

interface UseRoundsResult {
  rounds: Round[]
  currentRound: Round | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createRound: (
    input: CreateRoundRequest
  ) => Promise<{ success: boolean; data?: Round; error?: string }>
  updateRound: (
    roundId: string,
    input: UpdateRoundRequest
  ) => Promise<{ success: boolean; data?: Round; error?: string }>
  deleteRound: (roundId: string) => Promise<{ success: boolean; error?: string }>
}

/**
 * 라운드 데이터를 가져오는 커스텀 훅
 *
 * @param clubId - 커뮤니티 ID (필수)
 * - 빈 문자열일 경우 데이터를 조회하지 않고 에러 상태를 반환합니다.
 * - 해당 clubId에 해당하는 회차만 필터링하여 반환합니다.
 *
 * @returns 라운드 목록, 현재 라운드, 로딩 상태, 에러, CRUD 함수
 */
export const useRounds = (clubId: string): UseRoundsResult => {
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRounds = useCallback(async () => {
    // clubId가 없으면 데이터 조회하지 않음
    if (!clubId) {
      setRounds([])
      setCurrentRound(null)
      setLoading(false)
      setError('커뮤니티 ID가 필요합니다')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(API_ENDPOINTS.ROUNDS.WITH_PARAMS({ clubId }))
      const result = await response.json()

      if (result.success && result.data) {
        // API 응답 구조: { success: true, data: { data: [], count: number, pagination: {} } }
        const roundsList = Array.isArray(result.data) ? result.data : result.data.data
        setRounds(roundsList || [])
        // 첫 번째 라운드를 현재 라운드로 설정
        setCurrentRound(roundsList && roundsList.length > 0 ? roundsList[0] : null)
      } else {
        setRounds([])
        setCurrentRound(null)
      }
    } catch (err) {
      console.error('Failed to fetch rounds:', err)
      setError(MESSAGES.ERROR.FAILED_TO_LOAD_ROUNDS)
    } finally {
      setLoading(false)
    }
  }, [clubId])

  /**
   * 새로운 라운드 생성
   * @param input - 라운드 생성 데이터
   * @returns 생성 결과
   */
  const createRound = useCallback(
    async (input: CreateRoundRequest) => {
      try {
        const response = await fetch(API_ENDPOINTS.ROUNDS.BASE, {
          method: 'POST',
          headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
          body: JSON.stringify(input),
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchRounds()
          return { success: true, data: result.data }
        }
        return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_CREATE_ROUND }
      } catch (err) {
        console.error('Failed to create round:', err)
        return { success: false, error: MESSAGES.ERROR.CREATING_ROUND_ERROR }
      }
    },
    [fetchRounds]
  )

  /**
   * 라운드 수정
   * @param roundId - 수정할 라운드 ID
   * @param input - 수정할 데이터
   * @returns 수정 결과
   */
  const updateRound = useCallback(
    async (roundId: string, input: UpdateRoundRequest) => {
      try {
        const response = await fetch(API_ENDPOINTS.ROUNDS.BY_ID(roundId), {
          method: 'PATCH',
          headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
          body: JSON.stringify(input),
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchRounds()
          return { success: true, data: result.data }
        }
        return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_UPDATE_ROUND }
      } catch (err) {
        console.error('Failed to update round:', err)
        return { success: false, error: MESSAGES.ERROR.UPDATING_ROUND_ERROR }
      }
    },
    [fetchRounds]
  )

  /**
   * 라운드 삭제 (소프트 삭제)
   * @param roundId - 삭제할 라운드 ID
   * @returns 삭제 결과
   */
  const deleteRound = useCallback(
    async (roundId: string) => {
      try {
        const response = await fetch(API_ENDPOINTS.ROUNDS.BY_ID(roundId), {
          method: 'DELETE',
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchRounds()
          return { success: true }
        }
        return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_DELETE_ROUND }
      } catch (err) {
        console.error('Failed to delete round:', err)
        return { success: false, error: MESSAGES.ERROR.DELETING_ROUND_ERROR }
      }
    },
    [fetchRounds]
  )

  useEffect(() => {
    fetchRounds()
  }, [fetchRounds])

  return {
    rounds,
    currentRound,
    loading,
    error,
    refetch: fetchRounds,
    createRound,
    updateRound,
    deleteRound,
  }
}
