'use client'

import { StrokeButton } from '@/components/ui'
import { MESSAGES } from '@/constants'
import type { StudyGoal } from '@/lib/types/goal'
import { renderWithEmpty } from '@/lib/utils'
import { memo, useState } from 'react'
import { isGoalsEmpty } from '../_utils'
import GoalItem from './GoalItem'
import styles from './GoalItem.module.css'

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
   * 목표 추가 핸들러 (새 목표 저장 시)
   */
  onAddGoal?: (title: string) => Promise<void>
  /**
   * 목표 수정 핸들러
   */
  onEdit?: (goalId: string, newTitle: string) => Promise<void>
  /**
   * 목표 삭제 핸들러
   */
  onDelete?: (goalId: string) => Promise<void>
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
  onEdit,
  onDelete,
}: GoalsListProps) {
  const [isAdding, setIsAdding] = useState(false)

  // 방어 코드: goals가 배열이 아닌 경우 빈 배열로 처리
  const safeGoals = Array.isArray(goals) ? goals : null

  const handleAddClick = () => {
    setIsAdding(true)
  }

  const handleSave = async (title: string) => {
    if (onAddGoal) {
      await onAddGoal(title)
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
  }

  // 빈 목표 객체 (편집용)
  const emptyGoal: StudyGoal = {
    goalId: 'temp-new-goal',
    ownerId: '',
    clubId: null,
    roundId: null,
    title: '',
    description: null,
    isTeam,
    isComplete: false,
    startDate: new Date(),
    endDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return (
    <div className={styles['goals-list']} role="list">
      {showAddButton && onAddGoal && (
        <StrokeButton
          className={styles['add-button']}
          onClick={handleAddClick}
          type="button"
          aria-label={MESSAGES.LABEL.GOAL_ADD}
          disabled={isAdding}
        >
          +
        </StrokeButton>
      )}
      {isAdding && (
        <GoalItem
          goal={emptyGoal}
          onToggle={async () => {}}
          isTeam={isTeam}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {renderWithEmpty(
        isGoalsEmpty(safeGoals || []),
        <p className={styles['goal-card']} role="status">
          {emptyMessage}
        </p>,
        safeGoals?.map(goal => (
          <GoalItem
            key={goal.goalId}
            goal={goal}
            onToggle={onToggle}
            isTeam={isTeam}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  )
}

export default memo(GoalsList)
