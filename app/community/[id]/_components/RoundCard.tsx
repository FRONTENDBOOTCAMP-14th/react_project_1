'use client'

import { LoadingState, ErrorState } from '@/components/common'
import type { Round } from '@/types/round'
import type { WithClubId, WithTeamLeaderPermission } from '@/types/common'
import styles from './RoundCard.module.css'
import { useRoundData, useGoals } from '@/lib/hooks'
import { renderWithLoading, renderWithError } from '@/lib/utils'
import GoalsSection from './GoalsSection'
import { MESSAGES } from '@/constants'
import { useGoalToggle } from '../_hooks/useGoalToggle'

/**
 * RoundCard 컴포넌트에 전달되는 속성
 */
interface RoundCardProps extends WithClubId, WithTeamLeaderPermission {}

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
      <p>{round ? MESSAGES.LABEL.ROUND_INFO(round.roundNumber) : MESSAGES.LABEL.NO_ROUND_INFO}</p>
    </header>
  )
}

/**
 * 라운드 카드 본문 컴포넌트에 전달되는 속성
 */
interface RoundCardBodyProps extends WithClubId, WithTeamLeaderPermission {
  /**
   * 현재 라운드 식별자 (선택)
   */
  roundId?: string
}

/**
 * 목표 추가 핸들러 (순수 함수)
 * 추후 목표 추가 모달/페이지 전환 로직으로 교체 예정
 */
const handleAddGoal = (): void => {
  console.log('Add goal clicked')
}

/**
 * 라운드 카드 본문 컴포넌트
 * - 목표 데이터 fetch 및 상태 관리
 * - 선언적 조건부 렌더링
 * @param props - RoundCardBodyProps
 */
function RoundCardBody({ clubId, isTeamLeader }: RoundCardBodyProps) {
  const { goals, loading, error, refetch } = useGoals(clubId)
  const { optimisticGoals, handleToggleComplete } = useGoalToggle(goals, refetch)

  return renderWithLoading(
    loading,
    <LoadingState message={MESSAGES.LOADING.GOALS} />,
    renderWithError(
      error,
      <ErrorState message={error || MESSAGES.ERROR.FAILED_TO_LOAD_GOALS} onRetry={refetch} />,
      <GoalsSection
        teamGoals={optimisticGoals.team}
        personalGoals={optimisticGoals.personal}
        onToggle={handleToggleComplete}
        isTeamLeader={isTeamLeader}
        onAddGoal={handleAddGoal}
      />
    )
  )
}
