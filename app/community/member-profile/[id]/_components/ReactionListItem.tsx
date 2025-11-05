'use client'

import { Popover } from '@/components/ui'
import { MESSAGES } from '@/constants'
import { formatDiffFromNow } from '@/lib/utils'
import { Ellipsis } from 'lucide-react'
import { toast } from 'sonner'
import styles from './ReactionListItem.module.css'

interface ReactionListItemProps {
  nickname: string
  isOwner: boolean
  createdAt: Date
  reaction: string
  reactionId: string
  memberId: string
}

export default function ReactionListItem({
  nickname,
  isOwner,
  createdAt,
  reaction,
  reactionId,
  memberId,
}: ReactionListItemProps) {
  const deleteReaction = async () => {
    try {
      toast.loading(MESSAGES.LOADING.REACTION_DELETING)
      const response = await fetch(`/api/reactions/${reactionId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss()
        toast.success(MESSAGES.SUCCESS.REACTION_DELETE)
        // Next.js 방식으로 페이지 새로고침
        const { revalidatePath } = await import('next/cache')
        revalidatePath(`/community/member-profile/${memberId}`)
      } else {
        toast.dismiss()
        toast.error(result.error || MESSAGES.ERROR.REACTION_DELETE_FAILED)
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
            actions={[
              {
                id: 'delete',
                label: MESSAGES.ACTION.DELETE,
                onClick: deleteReaction,
                isDanger: true,
              },
            ]}
          />
        )}
      </div>
    </li>
  )
}
