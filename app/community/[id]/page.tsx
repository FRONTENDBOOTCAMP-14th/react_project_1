'use client'

import { useParams } from 'next/navigation'
import StudyProfile from './_components/StudyProfile'
import Link from 'next/link'
import RoundCard from './_components/RoundCard'
import styles from './page.module.css'

export default function Page() {
  const { id } = useParams()
  const clubId = id as string

  return (
    <div className={styles.container}>
      <div className={styles['content-wrapper']}>
        <StudyProfile id={clubId} />
        <Link href={`/community/notification/${clubId}`} className={styles['notification-link']}>
          <span className={styles['notification-label']}>공지</span> 노트북 대여는 불가합니다
        </Link>
        <RoundCard clubId={clubId} />
      </div>
    </div>
  )
}
