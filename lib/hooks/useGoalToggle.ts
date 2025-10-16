import { useState, useEffect, useCallback } from 'react'
import type { StudyGoal } from '@/types/goal'
import { toast } from 'sonner'

interface GoalsState {
  team: StudyGoal[]
  personal: StudyGoal[]
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
 * @param refetch - 데이터 재조회 함수 (실패 시 롤백용)
 * @returns 낙관적 목표 상태와 토글 핸들러
 */
export const useGoalToggle = (
  goals: GoalsState,
  refetch: () => Promise<void>
): UseGoalToggleResult => {
  // 로컬 상태로 목표 관리
  const [optimisticGoals, setOptimisticGoals] = useState<GoalsState>(goals)

  // 서버 데이터가 변경되면 로컬 상태 동기화
  useEffect(() => {
    setOptimisticGoals(goals)
  }, [goals])

  const handleToggleComplete = useCallback(
    async (goalId: string, isComplete: boolean, isTeam: boolean) => {
      const type = isTeam ? 'team' : 'personal'

      // 1. 낙관적 UI 업데이트
      setOptimisticGoals(prev => ({
        ...prev,
        [type]: updateGoalComplete(prev[type], goalId, isComplete),
      }))

      // 2. API 호출
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
          // 실패 시 refetch로 서버 상태로 롤백
          await refetch()
          toast.dismiss()
          toast.error('목표를 업데이트하는데 실패했습니다.')
          return
        }

        // 3. API 성공: 베이스 상태 업데이트 생략
        // 낙관적 업데이트가 이미 UI에 반영되어 있으므로 추가 업데이트 불필요
        // 서버 상태는 다음 refetch 시점(페이지 재진입, 새로고침 등)에 자동 동기화
        toast.dismiss()
        toast.success('목표를 업데이트했습니다.')
      } catch (err) {
        console.error('Failed to toggle complete:', err)
        await refetch()
        toast.dismiss()
        toast.error('목표를 업데이트하는데 실패했습니다.')
      }
    },
    [refetch]
  )

  return { optimisticGoals, handleToggleComplete }
}
