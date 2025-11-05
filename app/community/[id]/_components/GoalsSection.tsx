'use client'

import { MESSAGES } from '@/constants'
import type { StudyGoal } from '@/lib/types/goal'
import { memo } from 'react'
import { useCommunityContext } from '../_context/CommunityContext'
import GoalsContainer from './GoalsContainer'
import styles from './GoalsSection.module.css'

/**
 * 목표 섹션 컴포넌트에 전달되는 속성
 */
export interface GoalsSectionProps {
  /**
   * 그룹 목표 목록
   */
  teamGoals: StudyGoal[]
  /**
   * 개인 목표 목록
   */
  personalGoals: StudyGoal[]
  /**
   * 완료 토글 콜백
   */
  onToggle: (goalId: string, isComplete: boolean, isTeam: boolean) => Promise<void>
  /**
   * 목표 추가 핸들러 (새 목표 저장 시)
   */
  onAddGoal?: (title: string, isTeam: boolean) => Promise<void>
  /**
   * 목표 수정 핸들러
   */
  onEdit?: (goalId: string, newTitle: string) => Promise<void>
  /**
   * 목표 삭제 핸들러
   */
  onDelete?: (goalId: string) => Promise<void>
  /**
   * 목표 섹션의 열림/닫힘 상태
   */
  isOpen?: boolean
}

/**
 * 목표 섹션 컴포넌트
 * 그룹 목표와 개인 목표를 구분하여 렌더링합니다.
 */
function GoalsSection({
  teamGoals,
  personalGoals,
  onToggle,
  onAddGoal,
  onEdit,
  onDelete,
  isOpen,
}: GoalsSectionProps) {
  const { isAdmin } = useCommunityContext()
  return (
    isOpen && (
      <section className={styles['goals-section']} aria-label={MESSAGES.LABEL.GOALS_SECTION}>
        <GoalsContainer
          title={MESSAGES.LABEL.TEAM_GOALS}
          goals={teamGoals}
          onToggle={onToggle}
          isTeam={true}
          showAddButton={!!isAdmin}
          emptyMessage={MESSAGES.EMPTY.TEAM_GOALS}
          onAddGoal={onAddGoal ? async title => onAddGoal(title, true) : undefined}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <GoalsContainer
          title={MESSAGES.LABEL.PERSONAL_GOALS}
          goals={personalGoals}
          onToggle={onToggle}
          isTeam={false}
          showAddButton={true}
          emptyMessage={MESSAGES.EMPTY.PERSONAL_GOALS}
          onAddGoal={onAddGoal ? async title => onAddGoal(title, false) : undefined}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </section>
    )
  )
}

export default memo(GoalsSection)
