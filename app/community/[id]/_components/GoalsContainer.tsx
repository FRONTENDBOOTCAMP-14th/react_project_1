'use client'

import { memo } from 'react'
import type { StudyGoal } from '@/lib/types/goal'
import GoalsList from './GoalsList'
import styles from './GoalsContainer.module.css'

/**
 * 목표 컨테이너 컴포넌트에 전달되는 속성
 */
export interface GoalsContainerProps {
  /**
   * 컨테이너 제목
   */
  title: string
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
 * 목표 컨테이너 컴포넌트 (순수 컴포넌트)
 * @param props - GoalsContainerProps
 */
function GoalsContainer({
  title,
  goals,
  onToggle,
  isTeam,
  showAddButton = false,
  emptyMessage,
  onAddGoal,
  onEdit,
  onDelete,
}: GoalsContainerProps) {
  return (
    <section className={styles['goals-container']} aria-label={title}>
      <div className={styles['goals-header']}>
        <p>{title}</p>
      </div>
      <GoalsList
        goals={goals}
        onToggle={onToggle}
        isTeam={isTeam}
        showAddButton={showAddButton}
        emptyMessage={emptyMessage}
        onAddGoal={onAddGoal}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </section>
  )
}

export default memo(GoalsContainer)
