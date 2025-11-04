'use client'

import { Checkbox, Popover, type PopoverAction } from '@/components/ui'
import type { CustomSession } from '@/lib/types'
import type { StudyGoal } from '@/lib/types/goal'
import { Check, Ellipsis, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { memo, useEffect, useRef, useState } from 'react'
import { useCommunityStore } from '../_hooks/useCommunityStore'
import styles from './GoalItem.module.css'

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
function GoalItem({ goal, onToggle, isTeam, onSave, onCancel, onEdit, onDelete }: GoalItemProps) {
  const { data: session } = useSession()
  const userId = (session as CustomSession)?.userId
  const isAdmin = useCommunityStore(state => state.isAdmin)
  const [title, setTitle] = useState(goal.title || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isOwner = userId && goal.ownerId === userId

  // onSave prop이 있으면 자동으로 편집 모드로 전환 (새 목표 추가 시)
  useEffect(() => {
    if (onSave && !isEditing) {
      setIsEditing(true)
    }
  }, [onSave, isEditing])

  // 새 목표 추가 시 input에 자동 focus
  useEffect(() => {
    if (isEditing && inputRef.current && onSave) {
      inputRef.current.focus()
      // 커서를 텍스트 끝으로 이동
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      )
    }
  }, [isEditing, onSave])

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
        if (confirm('정말로 삭제하시겠습니까?')) {
          onDelete?.(goal.goalId)
        }
      },
      isDanger: true,
    },
  ]

  const handleSave = async () => {
    if (!title.trim() || !onSave) return

    setIsSaving(true)
    try {
      await onSave(title.trim())
    } catch (error) {
      console.error('Failed to save goal:', error)
      // 에러가 발생하면 title을 원래 상태로 복원하지 않음 (사용자가 입력한 내용 유지)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!title.trim() || !onEdit) return

    setIsSaving(true)
    try {
      await onEdit(goal.goalId, title.trim())
      setIsEditing(false) // 성공 시 편집 모드 종료
    } catch (error) {
      console.error('Failed to edit goal:', error)
      // 에러 발생 시 원래 제목으로 복원
      setTitle(goal.title || '')
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 새 목표 추가 모드 vs 기존 목표 수정 모드 분기
      if (onSave) {
        handleSave()
      } else if (onEdit) {
        handleEdit()
      }
    } else if (e.key === 'Escape') {
      // 취소 처리
      if (onEdit) {
        setTitle(goal.title || '') // 원래 제목으로 복원
        setIsEditing(false)
      } else if (onSave) {
        onCancel?.()
      }
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
            placeholder={onSave ? '새 목표를 입력하세요' : '목표를 입력하세요'}
            className={styles['goal-input']}
            disabled={isSaving}
            aria-label="목표 입력"
          />
        </div>
        <div className={styles['goal-actions']}>
          <button
            onClick={onSave ? handleSave : handleEdit}
            disabled={!title.trim() || isSaving}
            className={styles['action-button']}
            aria-label="저장"
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            onClick={
              onEdit
                ? () => {
                    setTitle(goal.title || '')
                    setIsEditing(false)
                  }
                : onCancel
            }
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
          disabled={!userId || (!isAdmin && isTeam)}
        />
        <p className={styles['goal-description']}>{goal.title}</p>
      </div>
      {isOwner && <Popover trigger={<Ellipsis />} actions={popoverActions} />}
    </div>
  )
}

export default memo(GoalItem)
