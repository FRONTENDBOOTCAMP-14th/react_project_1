import { API_ENDPOINTS, MESSAGES } from '@/constants'
import type { CreateRoundRequest, Round, UpdateRoundRequest } from '@/lib/types/round'
import { deleter, fetcher, patcher, poster } from '@/lib/utils/swr'
import { useCallback } from 'react'
import useSWR, { mutate } from 'swr'

interface UseRoundsResult {
  rounds: Round[]
  currentRound: Round | null
  loading: boolean
  error: Error | undefined
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

// API 응답 타입 정의
interface RoundsResponse {
  data: Round[]
  count: number
}

/**
 * 라운드 데이터를 가져오는 SWR 기반 커스텀 훅
 *
 * @param clubId - 커뮤니티 ID (필수)
 * - 빈 문자열일 경우 데이터를 조회하지 않고 에러 상태를 반환합니다.
 * - 해당 clubId에 해당하는 회차만 필터링하여 반환합니다.
 *
 * @returns 라운드 목록, 현재 라운드, 로딩 상태, 에러, CRUD 함수
 */
export const useRounds = (clubId: string): UseRoundsResult => {
  // URL 구성 - clubId가 없으면 요청하지 않음
  const url = clubId ? API_ENDPOINTS.ROUNDS.WITH_PARAMS({ clubId }) : null

  // SWR로 데이터 페칭
  const { data, error, isLoading } = useSWR<RoundsResponse>(url, fetcher)

  // 데이터 추출 및 처리
  const rounds = data?.data || []
  const currentRound = rounds.length > 0 ? rounds[0] : null

  // 재조회 함수
  const refetch = useCallback(async () => {
    if (url) {
      await mutate(url)
    }
  }, [url])

  /**
   * 새로운 라운드 생성
   * @param input - 라운드 생성 데이터
   * @returns 생성 결과
   */
  const createRound = useCallback(
    async (input: CreateRoundRequest) => {
      try {
        const data = await poster<Round>(API_ENDPOINTS.ROUNDS.BASE, input)

        // 성공 시 캐시 무효화 및 재조회
        await refetch()
        return { success: true, data }
      } catch (err) {
        console.error('Failed to create round:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : MESSAGES.ERROR.CREATING_ROUND_ERROR,
        }
      }
    },
    [refetch]
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
        const data = await patcher<Round>(API_ENDPOINTS.ROUNDS.BY_ID(roundId), input)

        // 성공 시 캐시 무효화 및 재조회
        await refetch()
        return { success: true, data }
      } catch (err) {
        console.error('Failed to update round:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : MESSAGES.ERROR.UPDATING_ROUND_ERROR,
        }
      }
    },
    [refetch]
  )

  /**
   * 라운드 삭제 (소프트 삭제)
   * @param roundId - 삭제할 라운드 ID
   * @returns 삭제 결과
   */
  const deleteRound = useCallback(
    async (roundId: string) => {
      try {
        await deleter(API_ENDPOINTS.ROUNDS.BY_ID(roundId))

        // 성공 시 캐시 무효화 및 재조회
        await refetch()
        return { success: true }
      } catch (err) {
        console.error('Failed to delete round:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : MESSAGES.ERROR.DELETING_ROUND_ERROR,
        }
      }
    },
    [refetch]
  )

  return {
    rounds,
    currentRound,
    loading: isLoading,
    error: clubId && !url ? new Error('커뮤니티 ID가 필요합니다') : error,
    refetch,
    createRound,
    updateRound,
    deleteRound,
  }
}
