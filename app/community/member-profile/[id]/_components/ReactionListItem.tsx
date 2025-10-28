import { formatDate } from '@/lib/utils'

export default function ReactionListItem({
  nickname,
  createdAt,
  reaction,
}: {
  nickname: string
  createdAt: Date
  reaction: string
}) {
  return (
    <li>
      <p>{nickname}</p>
      <p>{formatDate(createdAt)}</p>
      <p>{reaction}</p>
    </li>
  )
}
