import prisma from '@/lib/prisma'
import ReactionListItem from './ReactionListItem'
import styles from './ReactionList.module.css'

export default async function ReactionList({ memberId }: { memberId: string }) {
  const reactions = await prisma.reaction.findMany({
    where: {
      member_id: memberId,
    },
    select: {
      reactionId: true,
      reaction: true,
      createdAt: true,
      user: {
        select: {
          nickname: true,
        },
      },
    },
  })

  return (
    <ul className={styles.list}>
      {reactions.map(reaction => (
        <ReactionListItem
          key={reaction.reactionId}
          nickname={reaction.user.nickname || ''}
          createdAt={reaction.createdAt}
          reaction={reaction.reaction}
        />
      ))}
    </ul>
  )
}
