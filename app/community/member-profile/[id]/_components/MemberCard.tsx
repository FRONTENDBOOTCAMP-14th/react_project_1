import { formatDiffFromNow } from '@/lib/utils'
import { memo } from 'react'
import styles from './MemberCard.module.css'

function MemberCard({
  nickname,
  role,
  joinedAt,
}: {
  nickname: string
  role: string
  joinedAt: Date
}) {
  return (
    <div className={styles['member-card']}>
      <h2>{nickname}</h2>
      <p>{role === 'admin' ? '관리자' : '멤버'}</p>
      <p>가입일: {formatDiffFromNow(joinedAt)}</p>
    </div>
  )
}

export default memo(MemberCard)
