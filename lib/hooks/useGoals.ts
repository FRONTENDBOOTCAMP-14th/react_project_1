import { API_ENDPOINTS, MESSAGES } from '@/constants'
import type { CreateGoalInput, StudyGoal, UpdateGoalInput } from '@/lib/types/goal'
import { fetcher } from '@/lib/utils/swr'
import { useCallback } from 'react'
import useSWR, { mutate } from 'swr'

interface GoalsState {
  team: StudyGoal[]
  personal: StudyGoal[]
}

interface UseGoalsData {
  goals: GoalsState
  loading: boolean
  error: Error | undefined
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
 * 목표 데이터를 가져오는 SWR 기반 커스텀 훅
 * @param clubId - 클럽 ID
 * @param roundId - 라운드 ID (선택, 없으면 전체 목표 조회)
 * @returns 목표 데이터, 로딩 상태, 에러, 재조회 함수
 */
export const useGoals = (clubId: string, roundId?: string): UseGoalsData => {
  // 팀 목표 조회
  const teamUrl = API_ENDPOINTS.GOALS.WITH_PARAMS({
    clubId,
    isTeam: true,
    ...(roundId && { roundId }),
  })

  const {
    data: teamData,
    error: teamError,
    isLoading: teamLoading,
  } = useSWR<StudyGoal[]>(teamUrl, fetcher)

  // 개인 목표 조회
  const personalUrl = API_ENDPOINTS.GOALS.WITH_PARAMS({
    clubId,
    isTeam: false,
    ...(roundId && { roundId }),
  })

  const {
    data: personalData,
    error: personalError,
    isLoading: personalLoading,
  } = useSWR<StudyGoal[]>(personalUrl, fetcher)

  // 로딩 상태 (둘 중 하나라도 로딩 중이면 true)
  const loading = teamLoading || personalLoading

  // 에러 상태 (둘 중 하나라도 에러가 있으면 해당 에러)
  const error = teamError || personalError

  // 목표 데이터 상태
  const goals: GoalsState = {
    team: teamData || [],
    personal: personalData || [],
  }

  // 재조회 함수
  const refetch = useCallback(async () => {
    await Promise.all([mutate(teamUrl), mutate(personalUrl)])
  }, [teamUrl, personalUrl])

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
          // 성공 시 캐시 무효화 및 재조회
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
          // 성공 시 캐시 무효화 및 재조회
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
          // 성공 시 캐시 무효화 및 재조회
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
