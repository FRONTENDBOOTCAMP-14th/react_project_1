'use client'

import { deleteRoundAction, markAttendanceAction, updateRoundAction } from '@/app/actions/rounds'
import { ErrorState, LoadingState } from '@/components/common'
import { IconButton, Popover, StrokeButton, type PopoverAction } from '@/components/ui'
import { MESSAGES } from '@/constants'
import { useGoals } from '@/lib/hooks'
import type { CustomSession } from '@/lib/types'
import type { Round } from '@/lib/types/round'
import {
  formatDateRangeUTC,
  fromDatetimeLocalString,
  renderWithError,
  renderWithLoading,
  toDatetimeLocalString,
} from '@/lib/utils'
import { ChevronDown, ChevronUp, EllipsisVertical, MapPin } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useCommunityContext } from '../_context/CommunityContext'
import { useGoalToggle } from '../_hooks/useGoalToggle'
import GoalsSection from './GoalsSection'
import styles from './RoundCard.module.css'

/**
 * RoundCard 컴포넌트에 전달되는 속성
 */
interface RoundCardProps {
  /**
   * 표시할 라운드 정보
   */
  round: Round | null
  /**
   * 라운드 카드가 열려있는지 여부
   */
  isOpen: boolean
  /**
   * 라운드 카드 열림/닫힘 토글 핸들러
   */
  onToggleOpen: () => void
  /**
   * 라운드 데이터 재조회 함수
   */
  onRefetch?: () => Promise<void>
}

/**
 * 라운드 카드 프레젠테이션 컴포넌트
 * 라운드 정보를 보여주고, 라운드에 속한 목표(그룹/개인)를 렌더링합니다.
 * @param props - RoundCardProps
 */
export default function RoundCard({
  round,
  isOpen = false,
  onToggleOpen,
  onRefetch,
}: RoundCardProps) {
  const { clubId } = useCommunityContext()
  const [, startTransition] = useTransition()

  const handleDelete = async () => {
    if (!round) return

    startTransition(async () => {
      const result = await deleteRoundAction(round.roundId, clubId)

      if (result.success) {
        toast.success('회차가 삭제되었습니다')
        await onRefetch?.()
      } else {
        toast.error(result.error || '삭제에 실패했습니다')
      }
    })
  }

  return (
    <article className={styles['round-card-wrapper']} aria-label={MESSAGES.LABEL.ROUND_CARD}>
      <RoundCardHeader
        round={round}
        isOpen={isOpen}
        onToggleOpen={onToggleOpen}
        onDelete={handleDelete}
        onRefetch={onRefetch}
      />
      <RoundCardBody roundId={round?.roundId} isOpen={isOpen} />
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
  /**
   * 라운드 카드가 열려있는지 여부
   */
  isOpen: boolean
  /**
   * 라운드 카드 열림/닫힘 토글 핸들러
   */
  onToggleOpen: () => void
  /**
   * 라운드 삭제 핸들러
   */
  onDelete?: () => void
  /**
   * 라운드 데이터 재조회 함수
   */
  onRefetch?: () => Promise<void>
}

/**
 * 라운드 헤더 컴포넌트
 * @param props - RoundCardHeaderProps
 */
function RoundCardHeader({
  round,
  isOpen,
  onToggleOpen,
  onDelete,
  onRefetch,
}: RoundCardHeaderProps) {
  const { data: session } = useSession()
  const { clubId } = useCommunityContext()
  const userId = (session as CustomSession)?.userId
  const [, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    roundNumber: round?.roundNumber || 1,
    startDate: toDatetimeLocalString(round?.startDate),
    endDate: toDatetimeLocalString(round?.endDate),
    location: round?.location || '',
  })
  const [hasAttended, setHasAttended] = useState(false)
  const [checkingAttendance, setCheckingAttendance] = useState(false)
  const now = new Date() // 임시: 클라이언트 시간 사용 (추후 동기화 로직 개선)
  const start = round?.startDate ? new Date(round.startDate) : null
  const end = round?.endDate ? new Date(round.endDate) : null
  const isWithinWindow = start && end ? now >= start && now <= end : false
  const isAttendanceClosed = !isWithinWindow

  useEffect(() => {
    const checkAttendance = async () => {
      if (!round?.roundId) return

      try {
        if (!userId) return

        setCheckingAttendance(true)
        const response = await fetch(`/api/attendance?userId=${userId}&roundId=${round.roundId}`)
        const result = await response.json()

        if (result.success && result.data.data.length > 0) {
          setHasAttended(true)
        }
      } catch (error) {
        console.error('출석 확인 실패:', error)
      } finally {
        setCheckingAttendance(false)
      }
    }

    checkAttendance()
  }, [round?.roundId, userId])

  const popoverActions: PopoverAction[] = [
    {
      id: 'edit',
      label: '수정',
      onClick: () => setIsEditing(true),
    },
    {
      id: 'delete',
      label: '삭제',
      onClick: () => {
        if (confirm('정말로 이 회차를 삭제하시겠습니까?\n삭제된 회차는 복구할 수 없습니다.')) {
          onDelete?.()
        }
      },
      isDanger: true,
    },
  ]

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!round) return

    startTransition(async () => {
      const result = await updateRoundAction(round.roundId, clubId, {
        roundNumber: editForm.roundNumber,
        startDate: editForm.startDate ? fromDatetimeLocalString(editForm.startDate) : null,
        endDate: editForm.endDate ? fromDatetimeLocalString(editForm.endDate) : null,
        location: editForm.location || null,
      })

      if (result.success) {
        toast.success('회차가 수정되었습니다')
        setIsEditing(false)
        await onRefetch?.()
      } else {
        toast.error(result.error || '수정에 실패했습니다')
      }
    })
  }

  const handleCancelEdit = () => {
    setEditForm({
      roundNumber: round?.roundNumber || 1,
      startDate: toDatetimeLocalString(round?.startDate),
      endDate: toDatetimeLocalString(round?.endDate),
      location: round?.location || '',
    })
    setIsEditing(false)
  }

  const handleAttendance = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!round) return
    if (isAttendanceClosed) {
      toast.error('출석 기간이 종료되었습니다')
      return
    }

    startTransition(async () => {
      const result = await markAttendanceAction(round.roundId, clubId)

      if (result.success) {
        toast.success('출석처리 되었습니다')
        setHasAttended(true)
      } else {
        toast.error(result.error || '출석 처리에 실패했습니다')
      }
    })
  }

  if (isEditing && round) {
    return (
      <header aria-label={MESSAGES.LABEL.ROUND_EDIT}>
        <form onSubmit={handleEditSubmit} className={styles['round-edit-form']}>
          <div className={styles['round-edit-fields']}>
            <div className={styles['edit-field']}>
              <label htmlFor="round-number">{MESSAGES.LABEL.ROUND_NUMBER}:</label>
              <input
                id="round-number"
                type="number"
                min="1"
                value={editForm.roundNumber}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, roundNumber: parseInt(e.target.value) || 1 }))
                }
                required
                aria-describedby="round-number-description"
              />
              <span id="round-number-description" className="sr-only">
                {MESSAGES.LABEL.ROUND_NUMBER_ARIA}
              </span>
            </div>
            <div className={styles['edit-field']}>
              <label htmlFor="start-date">{MESSAGES.LABEL.ROUND_START_DATE}:</label>
              <input
                id="start-date"
                type="datetime-local"
                value={editForm.startDate}
                onChange={e => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                aria-describedby="start-date-description"
              />
              <span id="start-date-description" className="sr-only">
                {MESSAGES.LABEL.ROUND_START_DATE_ARIA}
              </span>
            </div>
            <div className={styles['edit-field']}>
              <label htmlFor="end-date">{MESSAGES.LABEL.ROUND_END_DATE}:</label>
              <input
                id="end-date"
                type="datetime-local"
                value={editForm.endDate}
                onChange={e => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                aria-describedby="end-date-description"
              />
              <span id="end-date-description" className="sr-only">
                {MESSAGES.LABEL.ROUND_END_DATE_ARIA}
              </span>
            </div>
            <div className={styles['edit-field']}>
              <label htmlFor="location">{MESSAGES.LABEL.ROUND_LOCATION}:</label>
              <input
                id="location"
                type="text"
                value={editForm.location}
                onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder={MESSAGES.LABEL.ROUND_LOCATION_INPUT_PLACEHOLDER}
                aria-describedby="location-description"
              />
              <span id="location-description" className="sr-only">
                {MESSAGES.LABEL.ROUND_LOCATION_ARIA}
              </span>
            </div>
          </div>
          <div className={styles['round-edit-actions']}>
            <button type="submit" className={styles['edit-save-button']}>
              {MESSAGES.ACTION.SAVE}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className={styles['edit-cancel-button']}
            >
              {MESSAGES.ACTION.CANCEL}
            </button>
          </div>
        </form>
      </header>
    )
  }

  return (
    <header aria-label="회차 정보">
      <div className={styles['round-header-container']}>
        <IconButton
          type="button"
          onClick={onToggleOpen}
          aria-expanded={isOpen}
          className={styles['round-button']}
        >
          {round ? MESSAGES.LABEL.ROUND_INFO(round.roundNumber) : MESSAGES.LABEL.NO_ROUND_INFO}
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </IconButton>
        <Popover trigger={<EllipsisVertical />} actions={popoverActions} />
      </div>
      {(round?.startDate || round?.endDate || round?.location) && (
        <div className={styles['round-info']}>
          {(round?.startDate || round?.endDate) && (
            <p className={styles['round-date']}>
              {formatDateRangeUTC(round.startDate, round.endDate)}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {round?.location && (
              <p className={styles['round-location']}>
                <MapPin /> {round.location}
              </p>
            )}
            {hasAttended || checkingAttendance ? (
              <StrokeButton type="button" disabled>
                {checkingAttendance ? '출석 중...' : '출석 완료'}
              </StrokeButton>
            ) : isAttendanceClosed ? (
              <StrokeButton type="button" disabled>
                출석 기간 아님
              </StrokeButton>
            ) : (
              <StrokeButton type="button" onClick={handleAttendance}>
                출석하기
              </StrokeButton>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

/**
 * 라운드 카드 본문 컴포넌트에 전달되는 속성
 */
interface RoundCardBodyProps {
  /**
   * 현재 라운드 식별자 (선택)
   */
  roundId?: string
  /**
   * 라운드 카드가 열려있는지 여부
   */
  isOpen: boolean
}

/**
 * 라운드 카드 본문 컴포넌트
 * - 목표 데이터 fetch 및 상태 관리
 * - 선언적 조건부 렌더링
 * @param props - RoundCardBodyProps
 */
function RoundCardBody({ roundId, isOpen }: RoundCardBodyProps) {
  // Context에서 커뮤니티 정보 가져오기
  const { clubId, isAdmin } = useCommunityContext()
  const { data: session } = useSession()
  const { goals, loading, error, refetch, createGoal, updateGoal, deleteGoal } = useGoals(
    clubId || '',
    roundId
  )
  const { optimisticGoals, handleToggleComplete } = useGoalToggle(goals, refetch)

  /**
   * 목표 추가 핸들러
   * @param title - 목표 제목
   * @param isTeam - 그룹 목표 여부
   */
  const handleAddGoal = async (title: string, isTeam: boolean): Promise<void> => {
    const userId = (session as CustomSession)?.userId
    if (!userId) {
      toast.error('로그인이 필요합니다')
      return
    }

    // 현재 날짜로 시작/종료일 설정 (추후 개선 가능)
    const now = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1) // 1개월 후

    const goalData = {
      ownerId: userId,
      clubId: clubId || null,
      roundId: roundId || null,
      title,
      isTeam,
      startDate: now,
      endDate,
    }

    const result = await createGoal(goalData)

    if (!result.success) {
      toast.error(result.error || '목표 생성에 실패했습니다')
    } else {
      toast.success('목표가 추가되었습니다')
    }
  }

  /**
   * 목표 수정 핸들러
   * @param goalId - 목표 식별자
   * @param newTitle - 수정할 제목
   */
  const handleEditGoal = async (goalId: string, newTitle: string): Promise<void> => {
    const result = await updateGoal(goalId, { title: newTitle })

    if (result.success) {
      toast.success('목표가 수정되었습니다')
    } else {
      toast.error(result.error || '목표 수정에 실패했습니다')
      throw new Error(result.error)
    }
  }

  /**
   * 목표 삭제 핸들러
   * @param goalId - 목표 식별자
   */
  const handleDeleteGoal = async (goalId: string): Promise<void> => {
    const result = await deleteGoal(goalId)

    if (result.success) {
      toast.success('목표가 삭제되었습니다')
    } else {
      toast.error(result.error || '목표 삭제에 실패했습니다')
    }
  }

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
        isAdmin={isAdmin}
        onAddGoal={handleAddGoal}
        onEdit={handleEditGoal}
        onDelete={handleDeleteGoal}
        isOpen={isOpen}
      />
    )
  )
}
