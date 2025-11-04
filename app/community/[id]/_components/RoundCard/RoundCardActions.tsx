'use client'

import { IconButton, Popover, type PopoverAction } from '@/components/ui'
import type { Round } from '@/lib/types/round'
import { EllipsisVertical } from 'lucide-react'
import { memo } from 'react'
import { useCommunityStore } from '../../_hooks/useCommunityStore'

interface RoundCardActionsProps {
  /** 라운드 정보 */
  round: Round
  /** 라운드 삭제 핸들러 */
  onDelete: () => void
  /** 라운드 편집 모드 토글 핸들러 */
  onToggleEdit: () => void
}

/**
 * 라운드 카드 액션 컴포넌트
 * 라운드 편집 및 삭제 기능을 제공합니다.
 */
function RoundCardActions({ onDelete, onToggleEdit }: RoundCardActionsProps) {
  const isAdmin = useCommunityStore(state => state.isAdmin)

  const actions: PopoverAction[] = [
    {
      id: 'edit',
      label: '편집',
      onClick: onToggleEdit,
      disabled: !isAdmin,
    },
    {
      id: 'delete',
      label: '삭제',
      onClick: onDelete,
      disabled: !isAdmin,
      isDanger: true,
    },
  ]

  if (!isAdmin) {
    return null
  }

  return (
    <div className="round-actions">
      <Popover
        actions={actions}
        trigger={
          <IconButton aria-label="라운드 메뉴">
            <EllipsisVertical size={16} />
          </IconButton>
        }
      />
    </div>
  )
}

export default memo(RoundCardActions)
