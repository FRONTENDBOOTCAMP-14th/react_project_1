import { memo } from 'react'
import { Checkbox } from '@/components/ui'
import type { StudyGoal } from '@/types/goal'
import styles from './RoundCard.module.css'

/**
 * 개별 목표 아이템 컴포넌트에 전달되는 속성
 */
export interface GoalItemProps {
  /**
   * 목표 데이터
   */
  goal: StudyGoal
  /**
   * 완료 토글 콜백
   * @param goalId - 목표 식별자
   * @param isComplete - 토글 후 완료 상태
   * @param isTeam - 그룹 목표 여부
   */
  onToggle: (goalId: string, isComplete: boolean, isTeam: boolean) => Promise<void>
  /**
   * 그룹 목표 여부
   */
  isTeam: boolean
}

/**
 * 개별 목표 아이템 컴포넌트 (순수 컴포넌트)
 * @param props - GoalItemProps
 */
function GoalItem({ goal, onToggle, isTeam }: GoalItemProps) {
  return (
    <div className={styles['goal-card']}>
      <Checkbox
        checked={goal.isComplete}
        onChange={() => onToggle(goal.goalId, !goal.isComplete, isTeam)}
        aria-label={`${goal.title} 완료 표시`}
      />
      <p className={styles['goal-description']}>{goal.title}</p>
    </div>
  )
}

export default memo(GoalItem)
