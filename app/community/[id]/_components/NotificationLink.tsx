'use client'

import Link from 'next/link'
import styles from './CommunityContent.module.css'
import { ROUTES, MESSAGES } from '@/constants'
import type { CommunityDetail } from '@/lib/community/communityServer'
import { useCommunityContext } from '../_context/CommunityContext'

/**
 * 공지 링크 컴포넌트에 전달되는 속성
 */
interface NotificationLinkProps {
  /** 공지사항 목록 (서버에서 페칭됨) */
  notifications: CommunityDetail['notifications']
}

/**
 * 공지 링크 컴포넌트
 * - Server Component에서 전달받은 공지사항 데이터 사용
 * - 클라이언트 fetch 불필요
 */
export default function NotificationLink({ notifications }: NotificationLinkProps) {
  const { clubId } = useCommunityContext()
  // 고정 공지사항 우선, 없으면 최신 공지사항 표시
  const latestNotification = notifications.find(n => n.isPinned) || notifications[0]

  return (
    <Link
      href={ROUTES.COMMUNITY.NOTIFICATION(clubId)}
      className={styles['notification-link']}
      aria-label={MESSAGES.LABEL.COMMUNITY_NOTIFICATION_LINK}
    >
      <span className={styles['notification-label']}>{MESSAGES.LABEL.NOTIFICATION}</span>{' '}
      {latestNotification ? latestNotification.title : MESSAGES.LABEL.NO_REGISTERED_NOTIFICATIONS}
    </Link>
  )
}
