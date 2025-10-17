import { memo } from 'react'
import type { StudyGoal } from '@/types/goal'
import GoalsContainer from './GoalsContainer'
import styles from './RoundCard.module.css'
import { MESSAGES } from '@/constants'

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
   * 팀장 여부에 따라 그룹 목표 추가 버튼 노출
   */
  isTeamLeader?: boolean
  /**
   * 목표 추가 핸들러 (새 목표 저장 시)
   */
  onAddGoal?: (title: string, isTeam: boolean) => Promise<void>
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
  isTeamLeader,
  onAddGoal,
  isOpen,
}: GoalsSectionProps) {
  return (
    isOpen && (
      <section className={styles['goals-section']} aria-label="목표 섹션">
        <GoalsContainer
          title="그룹목표"
          goals={teamGoals}
          onToggle={onToggle}
          isTeam={true}
          showAddButton={!!isTeamLeader}
          emptyMessage={MESSAGES.EMPTY.TEAM_GOALS}
          onAddGoal={onAddGoal ? async title => onAddGoal(title, true) : undefined}
        />
        <GoalsContainer
          title="개인목표"
          goals={personalGoals}
          onToggle={onToggle}
          isTeam={false}
          showAddButton={true}
          emptyMessage={MESSAGES.EMPTY.PERSONAL_GOALS}
          onAddGoal={onAddGoal ? async title => onAddGoal(title, false) : undefined}
        />
      </section>
    )
  )
}

export default memo(GoalsSection)
