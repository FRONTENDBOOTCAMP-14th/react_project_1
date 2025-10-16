'use client'

import { useRounds } from '@/lib/hooks'
import { LoadingState, ErrorState } from '@/components/common'
import RoundCard from './RoundCard'
import { MESSAGES } from '@/constants'
import type { WithClubId, WithTeamLeaderPermission } from '@/types/common'
import styles from './RoundCard.module.css'

/**
 * RoundsList 컴포넌트에 전달되는 속성
 */
interface RoundsListProps extends WithClubId, WithTeamLeaderPermission {}

/**
 * 라운드 목록 컨테이너 컴포넌트
 * useRounds 훅을 사용하여 전체 라운드 목록을 가져와 각 라운드를 RoundCard로 렌더링합니다.
 * @param props - RoundsListProps
 */
export default function RoundsList({ clubId, isTeamLeader = false }: RoundsListProps) {
  const { rounds, loading, error, refetch } = useRounds(clubId)

  // 로딩 상태
  if (loading) {
    return <LoadingState message="라운드 목록을 불러오는 중..." />
  }

  // 에러 상태
  if (error) {
    return <ErrorState message={error || MESSAGES.ERROR.FAILED_TO_LOAD_ROUNDS} onRetry={refetch} />
  }

  // 라운드가 없는 경우
  if (rounds.length === 0) {
    return (
      <div className={styles['empty-state']}>
        <p>아직 생성된 라운드가 없습니다.</p>
      </div>
    )
  }

  // 라운드 목록 렌더링
  return (
    <div className={styles['rounds-list-container']}>
      {rounds.map(round => (
        <RoundCard key={round.roundId} round={round} clubId={clubId} isTeamLeader={isTeamLeader} />
      ))}
    </div>
  )
}
