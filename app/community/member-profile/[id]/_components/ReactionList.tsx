import prisma from '@/lib/prisma'
import ReactionListItem from './ReactionListItem'
import styles from './ReactionList.module.css'
import { getCurrentUserId } from '@/lib/auth'

export default async function ReactionList({ memberId }: { memberId: string }) {
  const currentUserId = await getCurrentUserId()
  const reactions = await prisma.reaction.findMany({
    where: {
      member_id: memberId,
      deletedAt: null,
    },
    select: {
      reactionId: true,
      reaction: true,
      createdAt: true,
      user: {
        select: {
          nickname: true,
          userId: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <ul className={styles.list}>
      {reactions.map(reaction => (
        <ReactionListItem
          key={reaction.reactionId}
          reactionId={reaction.reactionId}
          nickname={reaction.user.nickname || ''}
          isOwner={currentUserId === reaction.user.userId}
          createdAt={reaction.createdAt}
          reaction={reaction.reaction}
          memberId={memberId}
        />
      ))}
    </ul>
  )
}
