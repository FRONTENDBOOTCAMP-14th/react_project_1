'use client'

import { ErrorState, LoadingState } from '@/components/common'
import { StrokeButton } from '@/components/ui'
import type { CreateRoundRequest } from '@/lib/types/round'
import { useState } from 'react'
import { useCommunityContext } from '../_context/CommunityContext'
import { useRoundsData } from '../_hooks/useRoundsData'
import RoundCard from './RoundCard'
import styles from './RoundsList.module.css'

interface RoundsListProps {
  clubId: string
}

/**
 * 라운드 목록 컴포넌트
 * - 라운드 목록 조회 및 생성 기능 제공
 * - 팀장에게만 생성 권한 부여
 */
export default function RoundsList({ clubId }: RoundsListProps) {
  const { isAdmin } = useCommunityContext()
  const { rounds, loading, error, createRound, isEmpty } = useRoundsData(clubId)

  // 열린 라운드 ID를 추적하는 상태
  const [openRoundIds, setOpenRoundIds] = useState<Set<string>>(() => new Set())

  // 라운드 추가 폼 상태
  const [isAddingRound, setIsAddingRound] = useState(false)
  const [newRoundForm, setNewRoundForm] = useState<CreateRoundRequest>({
    clubId,
    roundNumber: 1,
    startDate: '',
    endDate: '',
    location: '',
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

  /**
   * 라운드 생성 핸들러
   */
  const handleCreateRound = async () => {
    if (!newRoundForm.startDate || !newRoundForm.endDate) {
      return
    }

    try {
      await createRound(newRoundForm)
      setIsAddingRound(false)
      setNewRoundForm({
        clubId,
        roundNumber: 1,
        startDate: '',
        endDate: '',
        location: '',
      })
    } catch (_error) {
      // 에러는 useRoundsData 훅에서 처리됨
    }
  }

  if (loading) {
    return <LoadingState message="회차 목록을 불러오는 중..." />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  return (
    <div className={styles['rounds-list-container']}>
      {isAdmin && (
        <div className={styles['add-round-section']}>
          {!isAddingRound ? (
            <StrokeButton
              className={styles['add-round-button']}
              onClick={() => setIsAddingRound(true)}
            >
              새 회차 추가
            </StrokeButton>
          ) : (
            <div className={styles['round-form']}>
              <input
                type="number"
                placeholder="회차 번호"
                value={newRoundForm.roundNumber}
                onChange={e =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    roundNumber: parseInt(e.target.value) || 1,
                  }))
                }
                min="1"
              />
              <input
                type="datetime-local"
                placeholder="시작일"
                value={
                  typeof newRoundForm.startDate === 'string'
                    ? newRoundForm.startDate
                    : newRoundForm.startDate
                      ? new Date(newRoundForm.startDate).toISOString().slice(0, 16)
                      : ''
                }
                onChange={e =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
              <input
                type="datetime-local"
                placeholder="종료일"
                value={
                  typeof newRoundForm.endDate === 'string'
                    ? newRoundForm.endDate
                    : newRoundForm.endDate
                      ? new Date(newRoundForm.endDate).toISOString().slice(0, 16)
                      : ''
                }
                onChange={e =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
              <input
                type="text"
                placeholder="장소"
                value={newRoundForm.location || ''}
                onChange={e =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
              />
              <StrokeButton onClick={handleCreateRound}>생성</StrokeButton>
              <StrokeButton onClick={() => setIsAddingRound(false)}>취소</StrokeButton>
            </div>
          )}
        </div>
      )}

      {isEmpty ? (
        <div className={styles['no-rounds']}>
          <p>아직 생성된 회차가 없습니다.</p>
        </div>
      ) : (
        <div className={styles['rounds-list']}>
          {rounds.map(round => (
            <RoundCard
              key={round.roundId}
              round={round}
              isOpen={openRoundIds.has(round.roundId)}
              onToggleOpen={() => handleToggleRound(round.roundId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
