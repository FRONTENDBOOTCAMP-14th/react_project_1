'use client'

import Link from 'next/link'
import styles from './CommunityContent.module.css'
import { ROUTES, MESSAGES } from '@/constants'
import { useNotifications } from '@/lib/hooks'

/**
 * 공지 링크 컴포넌트에 전달되는 속성
 */
interface NotificationLinkProps {
  /** 커뮤니티 식별자 */
  clubId: string
}

/**
 * 공지 링크 컴포넌트
 * 커뮤니티 공지 페이지로 이동하는 링크를 렌더링합니다.
 * useNotifications 훅을 사용하여 최신 공지사항을 표시합니다.
 */
export default function NotificationLink({ clubId }: NotificationLinkProps) {
  const { pinnedNotifications, notifications } = useNotifications({
    clubId,
    limit: 1,
  })

  // 고정 공지사항 우선, 없으면 최신 공지사항 표시
  const latestNotification = pinnedNotifications[0] || notifications[0]

  return (
    <Link
      href={ROUTES.COMMUNITY.NOTIFICATION(clubId)}
      className={styles['notification-link']}
      aria-label="커뮤니티 공지로 이동"
    >
      <span className={styles['notification-label']}>{MESSAGES.LABEL.NOTIFICATION}</span>{' '}
      {latestNotification ? latestNotification.title : '등록된 공지가 없습니다'}
    </Link>
  )
}
