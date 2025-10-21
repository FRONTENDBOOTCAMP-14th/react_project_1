'use client'

import { LoadingState, ErrorState } from '@/components/common'
import type { Round } from '@/lib/types/round'
import styles from './RoundCard.module.css'
import { useGoals } from '@/lib/hooks'
import { renderWithLoading, renderWithError, formatDateRange } from '@/lib/utils'
import GoalsSection from './GoalsSection'
import { MESSAGES } from '@/constants'
import { useGoalToggle } from '../_hooks/useGoalToggle'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { IconButton, Popover, type PopoverAction } from '@/components/ui'
import { ChevronDown, ChevronUp, EllipsisVertical, MapPin } from 'lucide-react'
import { useCommunityStore } from '../_hooks/useCommunityStore'
import type { CustomSession } from '@/lib/types'

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
  return (
    <article className={styles['round-card-wrapper']} aria-label="회차 카드">
      <RoundCardHeader round={round} isOpen={isOpen} onToggleOpen={onToggleOpen} />
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
}

/**
 * 라운드 헤더 컴포넌트
 * @param props - RoundCardHeaderProps
 */
function RoundCardHeader({ round, isOpen, onToggleOpen }: RoundCardHeaderProps) {
  const popoverActions: PopoverAction[] = [
    {
      id: 'edit',
      label: '수정',
      onClick: () => {},
    },
    {
      id: 'delete',
      label: '삭제',
      onClick: () => {},
      isDanger: true,
    },
  ]

  return (
    <header aria-label="회차 정보">
      <div className={styles['round-header-container']}>
        <div className={styles['round-header']}>
          <p className={styles['round-number']}>
            {round ? MESSAGES.LABEL.ROUND_INFO(round.roundNumber) : MESSAGES.LABEL.NO_ROUND_INFO}
          </p>
          <IconButton type="button" onClick={onToggleOpen} aria-expanded={isOpen}>
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </div>
        <Popover trigger={<EllipsisVertical />} actions={popoverActions} />
      </div>
      {(round?.startDate || round?.endDate || round?.location) && (
        <div className={styles['round-info']}>
          {(round?.startDate || round?.endDate) && (
            <p className={styles['round-date']}>
              {formatDateRange(round.startDate, round.endDate)}
            </p>
          )}
          {round?.location && (
            <p className={styles['round-location']}>
              <MapPin /> {round.location}
            </p>
          )}
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
  const { goals, loading, error, refetch, createGoal } = useGoals(clubId || '', roundId)
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
        onAddGoal={roundId ? handleAddGoal : undefined}
        isOpen={isOpen}
      />
    )
  )
}
