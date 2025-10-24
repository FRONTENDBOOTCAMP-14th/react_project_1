'use client'

import { memo, useState, useRef, useEffect } from 'react'
import { Checkbox, Popover, type PopoverAction } from '@/components/ui'
import type { StudyGoal } from '@/lib/types/goal'
import styles from './RoundCard.module.css'
import { Check, Ellipsis, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import type { CustomSession } from '@/lib/types'
import { useCommunityStore } from '../_hooks/useCommunityStore'

/**
 * 개별 목표 아이템 컴포넌트에 전달되는 속성
 */
export interface GoalItemProps {
  /**
   * 목표 데이터
   */
  goal: StudyGoal
  /**
   * 완료 토글 콜백
   * @param goalId - 목표 식별자
   * @param isComplete - 토글 후 완료 상태
   * @param isTeam - 그룹 목표 여부
   */
  onToggle: (goalId: string, isComplete: boolean, isTeam: boolean) => Promise<void>
  /**
   * 그룹 목표 여부
   */
  isTeam: boolean
  /**
   * 편집 모드 (새 목표 추가 시)
   */
  isEditing?: boolean

  /**
   * 저장 콜백
   * @param title - 목표 제목
   */
  onSave?: (title: string) => Promise<void>

  /**
   * 취소 콜백
   */
  onCancel?: () => void

  /**
   * 목표 편집 콜백
   * @param goalId - 목표 식별자
   * @param newTitle - 편집 후 목표 제목
   */
  onEdit?: (goalId: string, newTitle: string) => Promise<void>

  /**
   * 목표 삭제 콜백
   * @param goalId - 목표 식별자
   */
  onDelete?: (goalId: string) => Promise<void>
}

/**
 * 개별 목표 아이템 컴포넌트 (순수 컴포넌트)
 * @param props - GoalItemProps
 */
function GoalItem({
  goal,
  onToggle,
  isTeam,
  isEditing = false,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}: GoalItemProps) {
  const { data: session } = useSession()
  const userId = (session as CustomSession)?.userId
  const isTeamLeader = useCommunityStore(state => state.isTeamLeader)
  const [title, setTitle] = useState(goal.title || '')
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isOwner = userId && goal.ownerId === userId

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

  // 편집 모드일 때 자동 포커스
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (!title.trim() || !onSave) return

    setIsSaving(true)
    try {
      await onSave(title.trim())
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel?.()
    }
  }

  // 편집 모드
  if (isEditing) {
    return (
      <div className={styles['goal-card']}>
        <div className={styles['goal-item']}>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="목표를 입력하세요"
            className={styles['goal-input']}
            disabled={isSaving}
            aria-label="목표 입력"
          />
        </div>
        <div className={styles['goal-actions']}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className={styles['action-button']}
            aria-label="저장"
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className={styles['action-button']}
            aria-label="취소"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  // 일반 모드
  return (
    <div className={styles['goal-card']}>
      <div className={styles['goal-item']}>
        <Checkbox
          checked={goal.isComplete}
          onChange={() => onToggle(goal.goalId, !goal.isComplete, isTeam)}
          aria-label={`${goal.title} 완료 표시`}
          disabled={!userId || (!isTeamLeader && isTeam)}
        />
        <p className={styles['goal-description']}>{goal.title}</p>
      </div>
      {isOwner && <Popover trigger={<Ellipsis />} actions={popoverActions} />}
    </div>
  )
}

export default memo(GoalItem)
