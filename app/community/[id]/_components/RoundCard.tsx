'use client'

import { Checkbox, StrokeButton } from '@/components/ui'
import { LoadingState, ErrorState } from '@/components/common'
import type { StudyGoal } from '@/types/goal'
import type { Round } from '@/types/round'
import styles from './RoundCard.module.css'
import { useRoundData, useGoalsData, useGoalToggle } from '@/lib/hooks'
import { renderWithLoading, renderWithError, renderWithEmpty } from '@/lib/utils'
import { isGoalsEmpty } from '../_utils'

/**
 * RoundCard 컴포넌트에 전달되는 속성
 */
interface RoundCardProps {
  /**
   * 커뮤니티(스터디) 식별자
   */
  clubId: string
  /**
   * 팀장 여부에 따라 그룹 목표 추가 버튼 노출
   */
  isTeamLeader?: boolean
}

/**
 * 라운드 카드 루트 컴포넌트
 * 현재 라운드 정보를 보여주고, 라운드에 속한 목표(그룹/개인)를 렌더링합니다.
 * @param props - RoundCardProps
 */
export default function RoundCard({ clubId, isTeamLeader = false }: RoundCardProps) {
  const { currentRound } = useRoundData(clubId)

  return (
    <article className={styles['round-card-wrapper']} aria-label="라운드 카드">
      <RoundCardHeader round={currentRound} />
      <RoundCardBody clubId={clubId} roundId={currentRound?.roundId} isTeamLeader={isTeamLeader} />
    </article>
  )
}

/**
 * 라운드 헤더 컴포넌트에 전달되는 속성
 */
interface RoundCardHeaderProps {
  /**
   * 현재 라운드 정보 (없을 수 있음)
   */
  round: Round | null
}

/**
 * 라운드 헤더 컴포넌트 (순수 컴포넌트)
 * @param props - RoundCardHeaderProps
 */
function RoundCardHeader({ round }: RoundCardHeaderProps) {
  return (
    <header aria-label="라운드 정보">
      <p>{round ? `${round.roundNumber}회차` : '회차 정보 없음'}</p>
    </header>
  )
}

/**
 * 라운드 카드 본문 컴포넌트에 전달되는 속성
 */
interface RoundCardBodyProps {
  /**
   * 커뮤니티(스터디) 식별자
   */
  clubId: string
  /**
   * 현재 라운드 식별자 (선택)
   */
  roundId?: string
  /**
   * 팀장 여부에 따라 그룹 목표 추가 버튼 노출
   */
  isTeamLeader?: boolean
}

/**
 * 목표 추가 핸들러 (순수 함수)
 * 추후 목표 추가 모달/페이지 전환 로직으로 교체 예정
 */
const handleAddGoal = (): void => {
  console.log('Add goal clicked')
}

/**
 * 개별 목표 아이템 컴포넌트에 전달되는 속성
 */
interface GoalItemProps {
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

/**
 * 목표 리스트 컴포넌트에 전달되는 속성
 */
interface GoalsListProps {
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
}: GoalsListProps) {
  return (
    <div className={styles['goals-list']} role="list">
      {showAddButton && (
        <StrokeButton
          className={styles['add-button']}
          onClick={handleAddGoal}
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

/**
 * 목표 컨테이너 컴포넌트에 전달되는 속성
 */
interface GoalsContainerProps {
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
      />
    </section>
  )
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
}: {
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
}) {
  return (
    <section className={styles['goals-section']} aria-label="목표 섹션">
      <GoalsContainer
        title="그룹목표"
        goals={teamGoals}
        onToggle={onToggle}
        isTeam={true}
        showAddButton={!!isTeamLeader}
        emptyMessage="그룹목표가 없습니다."
      />
      <GoalsContainer
        title="개인목표"
        goals={personalGoals}
        onToggle={onToggle}
        isTeam={false}
        showAddButton={true}
        emptyMessage="개인목표가 없습니다."
      />
    </section>
  )
}

/**
 * 라운드 카드 본문 컴포넌트
 * - 목표 데이터 fetch 및 상태 관리
 * - 선언적 조건부 렌더링
 * @param props - RoundCardBodyProps
 */
function RoundCardBody({ clubId, isTeamLeader }: RoundCardBodyProps) {
  const { goals, setGoals, loading, error, refetch } = useGoalsData(clubId)
  const { optimisticGoals, handleToggleComplete } = useGoalToggle(goals, setGoals, refetch)

  return renderWithLoading(
    loading,
    <LoadingState message="목표를 불러오는 중..." />,
    renderWithError(
      error,
      <ErrorState message={error || '목표를 불러오는데 실패했습니다.'} onRetry={refetch} />,
      <GoalsSection
        teamGoals={optimisticGoals.team}
        personalGoals={optimisticGoals.personal}
        onToggle={handleToggleComplete}
        isTeamLeader={isTeamLeader}
      />
    )
  )
}
