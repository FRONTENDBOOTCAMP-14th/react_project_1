'use client'

import { ErrorState, LoadingState } from '@/components/common'
import { IconButton, Popover, StrokeButton, type PopoverAction } from '@/components/ui'
import { MESSAGES } from '@/constants'
import { useGoals } from '@/lib/hooks'
import type { CustomSession } from '@/lib/types'
import type { Round } from '@/lib/types/round'
import { formatDateRange, renderWithError, renderWithLoading } from '@/lib/utils'
import { ChevronDown, ChevronUp, EllipsisVertical, MapPin } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCommunityStore } from '../_hooks/useCommunityStore'
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
}

/**
 * 라운드 카드 프레젠테이션 컴포넌트
 * 라운드 정보를 보여주고, 라운드에 속한 목표(그룹/개인)를 렌더링합니다.
 * @param props - RoundCardProps
 */
export default function RoundCard({ round, isOpen = false, onToggleOpen }: RoundCardProps) {
  const handleDelete = async () => {
    if (!round) return

    try {
      const response = await fetch(`/api/rounds/${round.roundId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        toast.success('회차가 삭제되었습니다')
        // 페이지를 새로고침하거나 상태 업데이트
        window.location.reload()
      } else {
        toast.error(result.error || '삭제에 실패했습니다')
      }
    } catch (_error) {
      toast.error('삭제 중 오류가 발생했습니다')
    }
  }

  return (
    <article className={styles['round-card-wrapper']} aria-label="회차 카드">
      <RoundCardHeader
        round={round}
        isOpen={isOpen}
        onToggleOpen={onToggleOpen}
        onDelete={handleDelete}
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
}

/**
 * 라운드 헤더 컴포넌트
 * @param props - RoundCardHeaderProps
 */
function RoundCardHeader({ round, isOpen, onToggleOpen, onDelete }: RoundCardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    roundNumber: round?.roundNumber || 1,
    startDate: round?.startDate ? new Date(round.startDate).toISOString().slice(0, 16) : '',
    endDate: round?.endDate ? new Date(round.endDate).toISOString().slice(0, 16) : '',
    location: round?.location || '',
  })

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

    try {
      const response = await fetch(`/api/rounds/${round.roundId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundNumber: editForm.roundNumber,
          startDate: editForm.startDate || null,
          endDate: editForm.endDate || null,
          location: editForm.location || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('회차가 수정되었습니다')
        setIsEditing(false)
        // 페이지를 새로고침하거나 상태 업데이트
        window.location.reload()
      } else {
        toast.error(result.error || '수정에 실패했습니다')
      }
    } catch (_error) {
      toast.error('수정 중 오류가 발생했습니다')
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      roundNumber: round?.roundNumber || 1,
      startDate: round?.startDate ? new Date(round.startDate).toISOString().slice(0, 16) : '',
      endDate: round?.endDate ? new Date(round.endDate).toISOString().slice(0, 16) : '',
      location: round?.location || '',
    })
    setIsEditing(false)
  }

  if (isEditing && round) {
    return (
      <header aria-label="회차 편집">
        <form onSubmit={handleEditSubmit} className={styles['round-edit-form']}>
          <div className={styles['round-edit-fields']}>
            <div className={styles['edit-field']}>
              <label>회차 번호:</label>
              <input
                type="number"
                min="1"
                value={editForm.roundNumber}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, roundNumber: parseInt(e.target.value) || 1 }))
                }
                required
              />
            </div>
            <div className={styles['edit-field']}>
              <label>시작일:</label>
              <input
                type="datetime-local"
                value={editForm.startDate}
                onChange={e => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className={styles['edit-field']}>
              <label>종료일:</label>
              <input
                type="datetime-local"
                value={editForm.endDate}
                onChange={e => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className={styles['edit-field']}>
              <label>장소:</label>
              <input
                type="text"
                value={editForm.location}
                onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="스터디 장소를 입력하세요"
              />
            </div>
          </div>
          <div className={styles['round-edit-actions']}>
            <button type="submit" className={styles['edit-save-button']}>
              저장
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className={styles['edit-cancel-button']}
            >
              취소
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
              {formatDateRange(round.startDate, round.endDate)}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {round?.location && (
              <p className={styles['round-location']}>
                <MapPin /> {round.location}
              </p>
            )}
            <StrokeButton type="button">참석하기</StrokeButton>
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
  // 전역 상태에서 커뮤니티 컴텍스트 가져오기
  const clubId = useCommunityStore(state => state.clubId)
  const isTeamLeader = useCommunityStore(state => state.isTeamLeader)
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
        isTeamLeader={isTeamLeader}
        onAddGoal={handleAddGoal}
        onEdit={handleEditGoal}
        onDelete={handleDeleteGoal}
        isOpen={isOpen}
      />
    )
  )
}
