'use client'

import { formatDiffFromNow } from '@/lib/utils'
import { memo } from 'react'
import styles from './MemberCard.module.css'
import Image from 'next/image'
import DefaultImg from '@/app/community/new/_components/assets/default-study01.png'
import { IconButton } from '@/components/ui'
import { ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'

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
          src={DefaultImg}
          alt={`${nickname} 프로필 이미지`}
          className={styles.image}
        />
        <p>{nickname}</p>
      </div>
      <div className={styles['description-container']}>
        <p className={styles.description}>스터디 가입일: {formatDiffFromNow(joinedAt)}</p>
        <p className={styles.description}>역할: {role === 'admin' ? '관리자' : '멤버'}</p>
        <p className={styles.description}>출석: {attendanceCount}회</p>
      </div>
      <IconButton
        onClick={() => {
          toast.success('좋아요 버튼을 눌렀습니다.')
        }}
      >
        <ThumbsUp size={30} strokeWidth={1} />
      </IconButton>
    </div>
  )
}

export default memo(MemberCard)
