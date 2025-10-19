import type { StudyGoal } from '@/lib/types/goal'

/**
 * 목표 배열에서 특정 목표의 완료 상태를 업데이트하는 순수 함수
 * @param goals - 목표 배열
 * @param goalId - 업데이트할 목표 ID
 * @param isComplete - 새로운 완료 상태
 * @returns 업데이트된 목표 배열 (불변성 유지)
 */
export const updateGoalComplete = (
  goals: StudyGoal[],
  goalId: string,
  isComplete: boolean
): StudyGoal[] => goals.map(goal => (goal.goalId === goalId ? { ...goal, isComplete } : goal))

/**
 * 목표 배열이 비어있는지 확인하는 순수 함수
 * @param goals - 목표 배열
 * @returns 비어있으면 true, 아니면 false
 */
export const isGoalsEmpty = (goals: StudyGoal[]): boolean => goals.length === 0

/**
 * 목표 배열을 필터링하는 고차 함수
 * @param predicate - 필터링 조건 함수
 * @returns 필터링된 목표 배열을 반환하는 함수
 */
export const filterGoals =
  (predicate: (goal: StudyGoal) => boolean) =>
  (goals: StudyGoal[]): StudyGoal[] =>
    goals.filter(predicate)

/**
 * 완료된 목표만 필터링하는 함수
 */
export const getCompletedGoals = filterGoals(goal => goal.isComplete)

/**
 * 미완료된 목표만 필터링하는 함수
 */
export const getIncompleteGoals = filterGoals(goal => !goal.isComplete)

/**
 * 목표 완료율을 계산하는 순수 함수
 * @param goals - 목표 배열
 * @returns 완료율 (0-100)
 */
export const calculateGoalCompletionRate = (goals: StudyGoal[]): number => {
  if (goals.length === 0) return 0
  const completedCount = getCompletedGoals(goals).length
  return Math.round((completedCount / goals.length) * 100)
}
