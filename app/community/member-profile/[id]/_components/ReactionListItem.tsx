'use client'

import { formatDiffFromNow } from '@/lib/utils'
import styles from './ReactionListItem.module.css'
import { Popover } from '@/components/ui'
import { Ellipsis } from 'lucide-react'
import { toast } from 'sonner'

interface ReactionListItemProps {
  nickname: string
  isOwner: boolean
  createdAt: Date
  reaction: string
  reactionId: string
}

export default function ReactionListItem({
  nickname,
  isOwner,
  createdAt,
  reaction,
  reactionId,
}: ReactionListItemProps) {
  const deleteReaction = async () => {
    try {
      toast.loading('reaction을 삭제 중입니다')
      const response = await fetch(`/api/reactions/${reactionId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss()
        toast.success('reaction이 삭제되었습니다')
        window.location.reload()
      } else {
        toast.dismiss()
        toast.error(result.error || 'reaction 삭제에 실패했습니다')
      }
    } catch (error) {
      toast.dismiss()
      console.error('reaction 삭제 실패:', error)
    }
  }
  return (
    <li className={styles.container}>
      <div className={styles.item}>
        <div className={styles.info}>
          <p>{nickname}</p>
          <p>{formatDiffFromNow(createdAt)}</p>
        </div>
        <p className={styles.reaction}>{reaction}</p>
      </div>
      <div>
        {isOwner && (
          <Popover
            trigger={<Ellipsis size={30} />}
            actions={[{ id: 'delete', label: '삭제', onClick: deleteReaction, isDanger: true }]}
          />
        )}
      </div>
    </li>
  )
}
