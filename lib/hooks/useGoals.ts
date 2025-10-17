import { useEffect, useState, useCallback } from 'react'
import type { StudyGoal, CreateGoalInput, UpdateGoalInput } from '@/lib/types/goal'
import { API_ENDPOINTS, HTTP_HEADERS, MESSAGES } from '@/constants'

interface GoalsState {
  team: StudyGoal[]
  personal: StudyGoal[]
}

interface UseGoalsData {
  goals: GoalsState
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createGoal: (
    input: CreateGoalInput
  ) => Promise<{ success: boolean; data?: StudyGoal; error?: string }>
  updateGoal: (
    goalId: string,
    input: UpdateGoalInput
  ) => Promise<{ success: boolean; data?: StudyGoal; error?: string }>
  deleteGoal: (goalId: string) => Promise<{ success: boolean; error?: string }>
}

/**
 * 목표 데이터를 병렬로 가져오는 커스텀 훅
 * @param clubId - 클럽 ID
 * @param roundId - 라운드 ID (선택, 없으면 전체 목표 조회)
 * @returns 목표 데이터, 로딩 상태, 에러, 재조회 함수
 */
export const useGoals = (clubId: string, roundId?: string): UseGoalsData => {
  const [goals, setGoals] = useState<GoalsState>({ team: [], personal: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 쿼리 파라미터 구성
      const params: { clubId: string; isTeam: boolean; roundId?: string } = {
        clubId,
        isTeam: true,
      }
      if (roundId) {
        params.roundId = roundId
      }

      // 병렬 호출로 성능 최적화
      const [teamResponse, personalResponse] = await Promise.all([
        fetch(API_ENDPOINTS.GOALS.WITH_PARAMS(params)),
        fetch(API_ENDPOINTS.GOALS.WITH_PARAMS({ ...params, isTeam: false })),
      ])

      const [teamData, personalData] = await Promise.all([
        teamResponse.json(),
        personalResponse.json(),
      ])

      setGoals({
        team: teamData.success ? teamData.data || [] : [],
        personal: personalData.success ? personalData.data || [] : [],
      })
    } catch (err) {
      console.error('Failed to fetch goals:', err)
      setError(MESSAGES.ERROR.FAILED_TO_LOAD_GOALS)
    } finally {
      setLoading(false)
    }
  }, [clubId, roundId])

  /**
   * 새로운 목표 생성
   * @param input - 목표 생성 데이터
   * @returns 생성 결과
   */
  const createGoal = useCallback(
    async (input: CreateGoalInput) => {
      try {
        const response = await fetch(API_ENDPOINTS.GOALS.BASE, {
          method: 'POST',
          headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
          body: JSON.stringify(input),
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchGoals()
          return { success: true, data: result.data }
        }
        return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_CREATE_GOAL }
      } catch (err) {
        console.error('Failed to create goal:', err)
        return { success: false, error: MESSAGES.ERROR.CREATING_GOAL_ERROR }
      }
    },
    [fetchGoals]
  )

  /**
   * 목표 수정
   * @param goalId - 수정할 목표 ID
   * @param input - 수정할 데이터
   * @returns 수정 결과
   */
  const updateGoal = useCallback(
    async (goalId: string, input: UpdateGoalInput) => {
      try {
        const response = await fetch(API_ENDPOINTS.GOALS.BY_ID(goalId), {
          method: 'PATCH',
          headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
          body: JSON.stringify(input),
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchGoals()
          return { success: true, data: result.data }
        }
        return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_UPDATE_GOAL }
      } catch (err) {
        console.error('Failed to update goal:', err)
        return { success: false, error: MESSAGES.ERROR.UPDATING_GOAL_ERROR }
      }
    },
    [fetchGoals]
  )

  /**
   * 목표 삭제 (소프트 삭제)
   * @param goalId - 삭제할 목표 ID
   * @returns 삭제 결과
   */
  const deleteGoal = useCallback(
    async (goalId: string) => {
      try {
        const response = await fetch(API_ENDPOINTS.GOALS.BY_ID(goalId), {
          method: 'DELETE',
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchGoals()
          return { success: true }
        }
        return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_DELETE_GOAL }
      } catch (err) {
        console.error('Failed to delete goal:', err)
        return { success: false, error: MESSAGES.ERROR.DELETING_GOAL_ERROR }
      }
    },
    [fetchGoals]
  )

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  }
}
