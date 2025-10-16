import { useEffect, useState, useCallback } from 'react'
import type { StudyGoal } from '@/types/goal'

interface GoalsState {
  team: StudyGoal[]
  personal: StudyGoal[]
}

interface CreateGoalInput {
  ownerId: string
  clubId?: string | null
  roundId?: string | null
  title: string
  description?: string | null
  isTeam?: boolean
  isComplete?: boolean
  startDate: string | Date
  endDate: string | Date
}

interface UpdateGoalInput {
  title?: string
  description?: string | null
  isTeam?: boolean
  isComplete?: boolean
  roundId?: string | null
  startDate?: string | Date
  endDate?: string | Date
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
 * @returns 목표 데이터, 로딩 상태, 에러, 재조회 함수
 */
export const useGoals = (clubId: string): UseGoalsData => {
  const [goals, setGoals] = useState<GoalsState>({ team: [], personal: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 병렬 호출로 성능 최적화
      const [teamResponse, personalResponse] = await Promise.all([
        fetch(`/api/goals?clubId=${clubId}&isTeam=true`),
        fetch(`/api/goals?clubId=${clubId}&isTeam=false`),
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
      setError('목표를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [clubId])

  /**
   * 새로운 목표 생성
   * @param input - 목표 생성 데이터
   * @returns 생성 결과
   */
  const createGoal = useCallback(
    async (input: CreateGoalInput) => {
      try {
        const response = await fetch('/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchGoals()
          return { success: true, data: result.data }
        }
        return { success: false, error: result.error || '목표 생성에 실패했습니다.' }
      } catch (err) {
        console.error('Failed to create goal:', err)
        return { success: false, error: '목표 생성 중 오류가 발생했습니다.' }
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
        const response = await fetch(`/api/goals/${goalId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchGoals()
          return { success: true, data: result.data }
        }
        return { success: false, error: result.error || '목표 수정에 실패했습니다.' }
      } catch (err) {
        console.error('Failed to update goal:', err)
        return { success: false, error: '목표 수정 중 오류가 발생했습니다.' }
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
        const response = await fetch(`/api/goals/${goalId}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 목록 재조회
          await fetchGoals()
          return { success: true }
        }
        return { success: false, error: result.error || '목표 삭제에 실패했습니다.' }
      } catch (err) {
        console.error('Failed to delete goal:', err)
        return { success: false, error: '목표 삭제 중 오류가 발생했습니다.' }
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
