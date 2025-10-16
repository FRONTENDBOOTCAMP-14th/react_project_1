import { memo } from 'react'
import { StrokeButton } from '@/components/ui'
import type { StudyGoal } from '@/types/goal'
import GoalItem from './GoalItem'
import styles from './RoundCard.module.css'
import { renderWithEmpty } from '@/lib/utils'
import { isGoalsEmpty } from '../_utils'

/**
 * 목표 리스트 컴포넌트에 전달되는 속성
 */
export interface GoalsListProps {
  /**
   * 목표 배열
   */
  goals: StudyGoal[]
  /**
   * 완료 토글 콜백
   */
  onToggle: (goalId: string, isComplete: boolean, isTeam: boolean) => Promise<void>
  /**
   * 그룹 목표 여부
   */
  isTeam: boolean
  /**
   * 상단 추가 버튼 노출 여부
   */
  showAddButton?: boolean
  /**
   * 비어있을 때 보여줄 메시지
   */
  emptyMessage: string
  /**
   * 목표 추가 핸들러
   */
  onAddGoal?: () => void
}

/**
 * 목표 리스트 컴포넌트 (순수 컴포넌트)
 * @param props - GoalsListProps
 */
function GoalsList({
  goals,
  onToggle,
  isTeam,
  showAddButton = false,
  emptyMessage,
  onAddGoal,
}: GoalsListProps) {
  return (
    <div className={styles['goals-list']} role="list">
      {showAddButton && onAddGoal && (
        <StrokeButton
          className={styles['add-button']}
          onClick={onAddGoal}
          type="button"
          aria-label="목표 추가"
        >
          +
        </StrokeButton>
      )}
      {renderWithEmpty(
        isGoalsEmpty(goals),
        <p className={styles['goal-card']} role="status">
          {emptyMessage}
        </p>,
        goals.map(goal => (
          <GoalItem key={goal.goalId} goal={goal} onToggle={onToggle} isTeam={isTeam} />
        ))
      )}
    </div>
  )
}

export default memo(GoalsList)
