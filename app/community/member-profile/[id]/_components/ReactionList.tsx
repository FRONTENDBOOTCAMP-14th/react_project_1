import prisma from '@/lib/prisma'
import ReactionListItem from './ReactionListItem'

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
    <ul>
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
