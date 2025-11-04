'use client'

import { ErrorState, LoadingState, FormField, SharedForm } from '@/components/common'
import { StrokeButton } from '@/components/ui'
import type { CommunityDetail } from '@/lib/community/communityServer'
import type { CreateRoundRequest } from '@/lib/types/round'
import { useState } from 'react'
import { useCommunityContext } from '../_context/CommunityContext'
import RoundCard from './RoundCard'
import styles from './RoundsList.module.css'

interface RoundsListProps {
  clubId: string
  rounds: CommunityDetail['rounds']
}

/**
 * 라운드 목록 컴포넌트
 * - Server Component에서 전달받은 라운드 데이터 사용
 * - 클라이언트 fetch 불필요
 * - Server Actions로 라운드 생성
 */
export default function RoundsList({ clubId, rounds }: RoundsListProps) {
  const { isAdmin } = useCommunityContext()
  const isEmpty = rounds.length === 0
  const loading = false
  const error = null

  // Server Actions로 라운드 생성
  const createRound = async (newRoundForm: CreateRoundRequest) => {
    const { createRoundAction } = await import('@/app/actions/rounds')
    return createRoundAction(newRoundForm)
  }

  const refetch = async () => {
    // Server Actions로 데이터 리프레치 (필요시 구현)
    console.log('Refetch rounds')
  }

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
            <SharedForm
              onSubmit={handleCreateRound}
              submitText="생성"
              cancelText="취소"
              onCancel={() => setIsAddingRound(false)}
              variant="inline"
              submitButtonType="fill"
              cancelButtonType="stroke"
            >
              <FormField
                label="회차 번호"
                type="number"
                value={String(newRoundForm.roundNumber || 1)}
                onChange={value =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    roundNumber: typeof value === 'number' ? value : parseInt(value) || 1,
                  }))
                }
                placeholder="회차 번호"
                min={1}
                fieldId="round-number-create"
                ariaDescription="회차 번호를 입력하세요 (1 이상의 숫자)"
              />
              <FormField
                label="시작일"
                type="datetime-local"
                value={
                  typeof newRoundForm.startDate === 'string'
                    ? newRoundForm.startDate
                    : newRoundForm.startDate
                      ? new Date(newRoundForm.startDate).toISOString().slice(0, 16)
                      : ''
                }
                onChange={value =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    startDate: typeof value === 'string' ? value : String(value),
                  }))
                }
                placeholder="시작일"
                fieldId="start-date-create"
                ariaDescription="회차 시작 일시를 선택하세요"
              />
              <FormField
                label="종료일"
                type="datetime-local"
                value={
                  typeof newRoundForm.endDate === 'string'
                    ? newRoundForm.endDate
                    : newRoundForm.endDate
                      ? new Date(newRoundForm.endDate).toISOString().slice(0, 16)
                      : ''
                }
                onChange={value =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    endDate: typeof value === 'string' ? value : String(value),
                  }))
                }
                placeholder="종료일"
                fieldId="end-date-create"
                ariaDescription="회차 종료 일시를 선택하세요"
              />
              <FormField
                label="장소"
                type="text"
                value={newRoundForm.location || ''}
                onChange={value =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    location: typeof value === 'string' ? value : String(value),
                  }))
                }
                placeholder="장소"
                fieldId="location-create"
                ariaDescription="스터디가 진행될 장소를 입력하세요"
              />
            </SharedForm>
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
              onRefetch={refetch}
            />
          ))}
        </div>
      )}
    </div>
  )
}
