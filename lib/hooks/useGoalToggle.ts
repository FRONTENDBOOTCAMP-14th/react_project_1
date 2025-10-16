import { useOptimistic, useTransition, useCallback } from 'react'
import type { StudyGoal } from '@/types/goal'
import { toast } from 'sonner'

interface GoalsState {
  team: StudyGoal[]
  personal: StudyGoal[]
}

interface OptimisticAction {
  type: 'team' | 'personal'
  goalId: string
  isComplete: boolean
}

interface UseGoalToggleResult {
  optimisticGoals: GoalsState
  handleToggleComplete: (goalId: string, isComplete: boolean, isTeam: boolean) => Promise<void>
}

/**
 * 목표 배열에서 특정 목표의 완료 상태를 업데이트하는 순수 함수
 */
const updateGoalComplete = (goals: StudyGoal[], goalId: string, isComplete: boolean): StudyGoal[] =>
  goals.map(goal => (goal.goalId === goalId ? { ...goal, isComplete } : goal))

/**
 * 목표 완료 상태를 낙관적으로 업데이트하는 커스텀 훅
 * @param goals - 현재 목표 상태
 * @param setGoals - 목표 상태 업데이트 함수
 * @param refetch - 데이터 재조회 함수
 * @returns 낙관적 목표 상태와 토글 핸들러
 */
export const useGoalToggle = (
  goals: GoalsState,
  setGoals: React.Dispatch<React.SetStateAction<GoalsState>>,
  refetch: () => Promise<void>
): UseGoalToggleResult => {
  const [, startTransition] = useTransition()

  const [optimisticGoals, setOptimisticGoals] = useOptimistic<GoalsState, OptimisticAction>(
    goals,
    (state, { type, goalId, isComplete }) => ({
      ...state,
      [type]: updateGoalComplete(state[type], goalId, isComplete),
    })
  )

  const handleToggleComplete = useCallback(
    async (goalId: string, isComplete: boolean, isTeam: boolean) => {
      const type = isTeam ? 'team' : 'personal'

      // 낙관적 업데이트
      startTransition(() => {
        setOptimisticGoals({ type, goalId, isComplete })
      })

      try {
        toast.loading('목표를 업데이트 중입니다...')
        const response = await fetch(`/api/goals/${goalId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isComplete }),
        })

        const data = await response.json()

        if (!data.success) {
          console.error('Failed to update goal:', data.error)
          await refetch()
          toast.dismiss()
          toast.error('목표를 업데이트하는데 실패했습니다.')
          return
        }

        // API 성공 후 실제 상태 업데이트 (UI 반영)
        setGoals(prev => ({
          ...prev,
          [type]: updateGoalComplete(prev[type], goalId, isComplete),
        }))

        toast.dismiss()
        toast.success('목표를 업데이트했습니다.')
      } catch (err) {
        console.error('Failed to toggle complete:', err)
        await refetch()
        toast.dismiss()
        toast.error('목표를 업데이트하는데 실패했습니다.')
      }
    },
    [refetch, setGoals, setOptimisticGoals, startTransition]
  )

  return { optimisticGoals, handleToggleComplete }
}
