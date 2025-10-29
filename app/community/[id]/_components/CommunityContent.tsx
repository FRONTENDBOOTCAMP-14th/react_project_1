'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import StudyProfile from './StudyProfile'
import RoundsList from './RoundsList'
import styles from './CommunityContent.module.css'
import { ROUTES, MESSAGES } from '@/constants'
import { useCommunityStore } from '../_hooks/useCommunityStore'
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
function NotificationLink({ clubId }: NotificationLinkProps) {
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

/**
 * 커뮤니티 콘텐츠 컴포넌트에 전달되는 속성
 */
interface CommunityContentProps {
  /** 커뮤니티 식별자 */
  clubId: string
  /** 팀장 권한 여부 (서버에서 확인됨) */
  isTeamLeader: boolean
  /** 멤버 여부 (서버에서 확인됨) */
  isMember: boolean
}

/**
 * 커뮤니티 콘텐츠 컴포넌트 (클라이언트 컴포넌트)
 * 프로필, 공지, 라운드 목록 등 커뮤니티 상세 정보를 구성합니다.
 * 서버에서 받은 데이터로 전역 상태를 초기화합니다.
 */
export default function CommunityContent({
  clubId,
  isTeamLeader,
  isMember,
}: CommunityContentProps) {
  const initializeCommunity = useCommunityStore(state => state.initializeCommunity)

  // 서버에서 받은 데이터로 전역 상태 초기화
  useEffect(() => {
    initializeCommunity(clubId, isTeamLeader, isMember)
  }, [clubId, isTeamLeader, isMember, initializeCommunity])

  return (
    <div className={styles['content-wrapper']}>
      <StudyProfile id={clubId} />
      <NotificationLink clubId={clubId} />
      {(isTeamLeader || isMember) && <RoundsList clubId={clubId} />}
    </div>
  )
}
