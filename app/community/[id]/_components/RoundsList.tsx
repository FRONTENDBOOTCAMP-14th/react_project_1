'use client'

import { useState } from 'react'
import { useRounds } from '@/lib/hooks'
import { LoadingState, ErrorState } from '@/components/common'
import RoundCard from './RoundCard'
import { MESSAGES } from '@/constants'
import styles from './RoundCard.module.css'
import { useCommunityStore } from '../_hooks/useCommunityStore'

/**
 * 라운드 목록 컨테이너 컴포넌트
 * useRounds 훅을 사용하여 전체 라운드 목록을 가져와 각 라운드를 RoundCard로 렌더링합니다.
 * 전역 상태에서 clubId와 isTeamLeader를 가져옵니다.
 */
export default function RoundsList() {
  // 전역 상태에서 커뮤니티 컨텍스트 가져오기
  const clubId = useCommunityStore(state => state.clubId)

  const { rounds, loading, error, refetch } = useRounds(clubId || '')
  // 열린 라운드 ID를 추적하는 상태 (기본값: 첫 번째 라운드 열림)
  const [openRoundIds, setOpenRoundIds] = useState<Set<string>>(() => {
    return new Set()
  })

  /**
   * 라운드 열림/닫힘 토글 핸들러
   */
  const handleToggleRound = (roundId: string) => {
    setOpenRoundIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roundId)) {
        newSet.delete(roundId)
      } else {
        newSet.add(roundId)
      }
      return newSet
    })
  }

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
        <RoundCard
          key={round.roundId}
          round={round}
          isOpen={openRoundIds.has(round.roundId)}
          onToggleOpen={() => handleToggleRound(round.roundId)}
        />
      ))}
    </div>
  )
}
