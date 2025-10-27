'use client'

import { useState } from 'react'
import { useRounds } from '@/lib/hooks'
import { LoadingState, ErrorState } from '@/components/common'
import RoundCard from './RoundCard'
import { MESSAGES } from '@/constants'
import styles from './RoundsList.module.css'
import { StrokeButton } from '@/components/ui'
import { toast } from 'sonner'
import roundCardStyles from './RoundCard.module.css'

interface RoundsListProps {
  clubId: string
}

/**
 * 라운드 목록 컨테이너 컴포넌트
 * useRounds 훅을 사용하여 전체 라운드 목록을 가져와 각 라운드를 RoundCard로 렌더링합니다.
 * 전역 상태에서 clubId와 isTeamLeader를 가져옵니다.
 */
export default function RoundsList({ clubId }: RoundsListProps) {
  // 열린 라운드 ID를 추적하는 상태 (기본값: 첫 번째 라운드 열림)
  const [openRoundIds, setOpenRoundIds] = useState<Set<string>>(() => {
    return new Set()
  })

  // 라운드 추가 폼 상태
  const [isAddingRound, setIsAddingRound] = useState(false)
  const [newRoundForm, setNewRoundForm] = useState({
    roundNumber: 1,
    startDate: '',
    endDate: '',
    location: '',
  })

  // useRounds 훅은 clubId가 없을 때 자동으로 에러 상태를 설정함
  const { rounds, loading, error, refetch, createRound } = useRounds(clubId || '')

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
   * 라운드 추가 버튼 클릭 핸들러
   */
  const handleAddRoundClick = () => {
    // 서버에서 자동으로 다음 라운드 번호를 계산하도록 비워둠
    setNewRoundForm({
      roundNumber: 0, // 0은 임시값, 실제로는 서버에서 자동 계산됨
      startDate: '',
      endDate: '',
      location: '',
    })
    setIsAddingRound(true)
  }

  /**
   * 라운드 추가 폼 제출 핸들러
   */
  const handleAddRoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await createRound({
        clubId,
        // roundNumber를 보내지 않으면 서버에서 자동으로 계산함 (소프트 삭제 고려)
        startDate: newRoundForm.startDate || null,
        endDate: newRoundForm.endDate || null,
        location: newRoundForm.location || null,
      })

      if (result.success) {
        toast.success('회차가 추가되었습니다')
        setIsAddingRound(false)
        setNewRoundForm({
          roundNumber: 0,
          startDate: '',
          endDate: '',
          location: '',
        })
      } else {
        toast.error(result.error || '회차 추가에 실패했습니다')
      }
    } catch (_error) {
      toast.error('회차 추가 중 오류가 발생했습니다')
    }
  }

  /**
   * 라운드 추가 취소 핸들러
   */
  const handleCancelAddRound = () => {
    setIsAddingRound(false)
    setNewRoundForm({
      roundNumber: 1,
      startDate: '',
      endDate: '',
      location: '',
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

  // 라운드 추가 폼 렌더링 함수
  const renderAddRoundForm = () => {
    if (!isAddingRound) return null

    return (
      <div className={roundCardStyles['round-card-wrapper']}>
        <form onSubmit={handleAddRoundSubmit} className={roundCardStyles['round-edit-form']}>
          <div className={roundCardStyles['round-edit-fields']}>
            <div className={roundCardStyles['edit-field']}>
              <label>시작일:</label>
              <input
                type="datetime-local"
                value={newRoundForm.startDate}
                onChange={e => setNewRoundForm(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className={roundCardStyles['edit-field']}>
              <label>종료일:</label>
              <input
                type="datetime-local"
                value={newRoundForm.endDate}
                onChange={e => setNewRoundForm(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className={roundCardStyles['edit-field']}>
              <label>장소:</label>
              <input
                type="text"
                value={newRoundForm.location}
                onChange={e => setNewRoundForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="스터디 장소를 입력하세요"
              />
            </div>
          </div>
          <div className={roundCardStyles['round-edit-actions']}>
            <button type="submit" className={roundCardStyles['edit-save-button']}>
              저장
            </button>
            <button
              type="button"
              onClick={handleCancelAddRound}
              className={roundCardStyles['edit-cancel-button']}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    )
  }

  // 라운드가 없는 경우
  if (rounds.length === 0) {
    return (
      <div className={styles['empty-state']}>
        {!isAddingRound && (
          <StrokeButton type="button" onClick={handleAddRoundClick}>
            회차 추가
          </StrokeButton>
        )}
        {renderAddRoundForm()}
        {!isAddingRound && <p>아직 생성된 회차가 없습니다.</p>}
      </div>
    )
  }

  // 라운드 목록 렌더링
  return (
    <div className={styles['rounds-list-container']}>
      {!isAddingRound && (
        <StrokeButton type="button" onClick={handleAddRoundClick}>
          회차 추가
        </StrokeButton>
      )}
      {renderAddRoundForm()}
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
