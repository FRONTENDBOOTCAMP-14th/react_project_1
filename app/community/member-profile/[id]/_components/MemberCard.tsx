'use client'

import { IconButton } from '@/components/ui'
import { MESSAGES } from '@/constants'
import { formatDiffFromNow } from '@/lib/utils'
import { ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import { memo } from 'react'
import { toast } from 'sonner'
import styles from './MemberCard.module.css'

function MemberCard({
  nickname,
  role,
  joinedAt,
  attendanceCount,
}: {
  nickname: string
  role: string
  joinedAt: Date
  attendanceCount?: number
}) {
  return (
    <div className={styles['member-card']}>
      <div className={styles['profile']}>
        <Image
          width={90}
          height={90}
          src="/svg/default-profile.svg"
          alt={MESSAGES.LABEL.PROFILE_IMAGE_ALT(nickname)}
          className={styles.image}
        />
        <p>{nickname}</p>
      </div>
      <div className={styles['description-container']}>
        <p className={styles.description}>
          {MESSAGES.LABEL.STUDY_JOIN_DATE}: {formatDiffFromNow(joinedAt)}
        </p>
        <p className={styles.description}>
          {MESSAGES.LABEL.ROLE}:{' '}
          {role === 'admin' ? MESSAGES.LABEL.ROLE_ADMIN : MESSAGES.LABEL.ROLE_MEMBER}
        </p>
        <p className={styles.description}>
          {MESSAGES.LABEL.ATTENDANCE}: {MESSAGES.LABEL.ATTENDANCE_COUNT(attendanceCount || 0)}
        </p>
      </div>
      <IconButton
        onClick={() => {
          toast.success(MESSAGES.ERROR.LIKE_BUTTON_CLICKED)
        }}
      >
        <ThumbsUp size={30} strokeWidth={1} />
      </IconButton>
    </div>
  )
}

export default memo(MemberCard)
