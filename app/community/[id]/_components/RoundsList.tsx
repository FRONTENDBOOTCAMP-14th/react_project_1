'use client'

import { ErrorState, FormField, LoadingState, SharedForm } from '@/components/common'
import { StrokeButton } from '@/components/ui'
import { MESSAGES } from '@/constants'
import type { CommunityDetail } from '@/lib/community/communityServer'
import type { CreateRoundRequest } from '@/lib/types/round'
import { toDatetimeLocalString } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCommunityContext } from '../_context/CommunityContext'
import RoundCard from './RoundCard'
import styles from './RoundsList.module.css'

interface RoundsListProps {
  rounds: CommunityDetail['rounds']
}

/**
 * 라운드 목록 컴포넌트
 * - Server Component에서 전달받은 라운드 데이터 사용
 * - 클라이언트 fetch 불필요
 * - Server Actions로 라운드 생성
 */
export default function RoundsList({ rounds }: RoundsListProps) {
  const { clubId, isAdmin } = useCommunityContext()
  const router = useRouter()
  const isEmpty = rounds.length === 0
  const loading = false
  const error = null

  // Server Actions로 라운드 생성
  const createRound = async (newRoundForm: CreateRoundRequest) => {
    const { createRoundAction } = await import('@/app/actions/rounds')
    return createRoundAction(newRoundForm)
  }

  const refetch = async () => {
    try {
      // Next.js router.refresh()로 페이지 데이터 새로고침
      router.refresh()
    } catch (error) {
      console.error('Failed to refetch rounds:', error)
    }
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

      // 라운드 생성 후 데이터 리프레치
      await refetch()
    } catch (_error) {
      // 에러는 useRoundsData 훅에서 처리됨
    }
  }

  if (loading) {
    return <LoadingState message={MESSAGES.LABEL.ROUNDS_LOADING} />
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
              {MESSAGES.ACTION.ADD_ROUND}
            </StrokeButton>
          ) : (
            <SharedForm
              onSubmit={handleCreateRound}
              submitText={MESSAGES.ACTION.CREATE}
              cancelText={MESSAGES.ACTION.CANCEL}
              onCancel={() => setIsAddingRound(false)}
              variant="inline"
              submitButtonType="fill"
              cancelButtonType="stroke"
            >
              <FormField
                label={MESSAGES.LABEL.ROUND_NUMBER}
                type="number"
                value={String(newRoundForm.roundNumber || 1)}
                onChange={value =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    roundNumber: typeof value === 'number' ? value : parseInt(value) || 1,
                  }))
                }
                placeholder={MESSAGES.LABEL.ROUND_NUMBER_PLACEHOLDER}
                min={1}
                fieldId="round-number-create"
                ariaDescription={MESSAGES.LABEL.ROUND_NUMBER_ARIA}
              />
              <FormField
                label={MESSAGES.LABEL.ROUND_START_DATE}
                type="datetime-local"
                value={
                  typeof newRoundForm.startDate === 'string'
                    ? newRoundForm.startDate
                    : toDatetimeLocalString(newRoundForm.startDate)
                }
                onChange={value =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    startDate: typeof value === 'string' ? value : String(value),
                  }))
                }
                placeholder={MESSAGES.LABEL.ROUND_START_DATE_PLACEHOLDER}
                fieldId="start-date-create"
                ariaDescription={MESSAGES.LABEL.ROUND_START_DATE_ARIA}
              />
              <FormField
                label={MESSAGES.LABEL.ROUND_END_DATE}
                type="datetime-local"
                value={
                  typeof newRoundForm.endDate === 'string'
                    ? newRoundForm.endDate
                    : toDatetimeLocalString(newRoundForm.endDate)
                }
                onChange={value =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    endDate: typeof value === 'string' ? value : String(value),
                  }))
                }
                placeholder={MESSAGES.LABEL.ROUND_END_DATE_PLACEHOLDER}
                fieldId="end-date-create"
                ariaDescription={MESSAGES.LABEL.ROUND_END_DATE_ARIA}
              />
              <FormField
                label={MESSAGES.LABEL.ROUND_LOCATION}
                type="text"
                value={newRoundForm.location || ''}
                onChange={value =>
                  setNewRoundForm((prev: CreateRoundRequest) => ({
                    ...prev,
                    location: typeof value === 'string' ? value : String(value),
                  }))
                }
                placeholder={MESSAGES.LABEL.ROUND_LOCATION_PLACEHOLDER}
                fieldId="location-create"
                ariaDescription={MESSAGES.LABEL.ROUND_LOCATION_ARIA}
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
