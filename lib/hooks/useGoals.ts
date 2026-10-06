import { API_ENDPOINTS, MESSAGES } from '@/constants'
import type { CreateGoalInput, StudyGoal, UpdateGoalInput } from '@/lib/types/goal'
import { useCallback } from 'react'
import { useAsyncData } from './useAsyncData'

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

const INITIAL_GOALS: GoalsState = { team: [], personal: [] }

/**
 * 목표 데이터를 병렬로 가져오는 커스텀 훅
 * @param clubId - 클럽 ID
 * @param roundId - 라운드 ID (선택, 없으면 전체 목표 조회)
 * @param options - 옵션 객체 (enabled 등)
 * @returns 목표 데이터, 로딩 상태, 에러, 재조회 함수
 */
export const useGoals = (
  clubId: string,
  roundId?: string,
  options?: { enabled?: boolean }
): UseGoalsData => {
  const isEnabled = options?.enabled ?? true

  const fetchGoals = useCallback(async (): Promise<GoalsState> => {
    if (!clubId || !isEnabled) {
      return INITIAL_GOALS
    }

    try {
      const params: { clubId: string; isTeam: boolean; roundId?: string } = {
        clubId,
        isTeam: true,
      }
      if (roundId) {
        params.roundId = roundId
      }

      const [teamResponse, personalResponse] = await Promise.all([
        fetch(API_ENDPOINTS.GOALS.WITH_PARAMS(params)),
        fetch(API_ENDPOINTS.GOALS.WITH_PARAMS({ ...params, isTeam: false })),
      ])

      const [teamResult, personalResult] = await Promise.all([
        teamResponse.json(),
        personalResponse.json(),
      ])

      const teamList =
        teamResult.success && teamResult.data
          ? Array.isArray(teamResult.data)
            ? teamResult.data
            : teamResult.data.data
          : []
      const personalList =
        personalResult.success && personalResult.data
          ? Array.isArray(personalResult.data)
            ? personalResult.data
            : personalResult.data.data
          : []

      return {
        team: teamList || [],
        personal: personalList || [],
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err)
      throw new Error(MESSAGES.ERROR.FAILED_TO_LOAD_GOALS)
    }
  }, [clubId, roundId, isEnabled])

  const {
    data: goals,
    loading,
    error,
    refetch,
  } = useAsyncData(fetchGoals, {
    initialData: INITIAL_GOALS,
    enabled: Boolean(clubId) && isEnabled,
  })

  /**
   * 새로운 목표 생성
   * @param input - 목표 생성 데이터
   * @returns 생성 결과
   */
  const createGoal = useCallback(
    async (input: CreateGoalInput) => {
      try {
        const { createGoalAction } = await import('@/app/actions/goals')
        const result = await createGoalAction(input)

        if (result.success) {
          await refetch()
          return { success: true, data: result.data as StudyGoal }
        }
        return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_CREATE_GOAL }
      } catch (err) {
        console.error('Failed to create goal:', err)
        return { success: false, error: MESSAGES.ERROR.CREATING_GOAL_ERROR }
      }
    },
    [refetch]
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
        const { updateGoalAction } = await import('@/app/actions/goals')
        const result = await updateGoalAction(goalId, input)

        if (result.success) {
          await refetch()
          return { success: true, data: result.data as StudyGoal }
        }
        return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_UPDATE_GOAL }
      } catch (err) {
        console.error('Failed to update goal:', err)
        return { success: false, error: MESSAGES.ERROR.UPDATING_GOAL_ERROR }
      }
    },
    [refetch]
  )

  /**
   * 목표 삭제 (소프트 삭제)
   * @param goalId - 삭제할 목표 ID
   * @returns 삭제 결과
   */
  const deleteGoal = useCallback(
    async (goalId: string) => {
      try {
        const { deleteGoalAction } = await import('@/app/actions/goals')
        const result = await deleteGoalAction(goalId)

        if (result.success) {
          await refetch()
          return { success: true }
        }
        return { success: false, error: result.error || MESSAGES.ERROR.FAILED_TO_DELETE_GOAL }
      } catch (err) {
        console.error('Failed to delete goal:', err)
        return { success: false, error: MESSAGES.ERROR.DELETING_GOAL_ERROR }
      }
    },
    [refetch]
  )

  return {
    goals,
    loading,
    error,
    refetch,
    createGoal,
    updateGoal,
    deleteGoal,
  }
}
