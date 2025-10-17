'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import StudyProfile from './StudyProfile'
import RoundsList from './RoundsList'
import styles from '../page.module.css'
import { AccentLink } from '@/components/ui'
import { ROUTES, MESSAGES } from '@/constants'
import { useCommunityStore } from '../_hooks/useCommunityStore'

/**
 * 공지 링크 컴포넌트에 전달되는 속성
 */
interface NotificationLinkProps {
  /** 커뮤니티 식별자 */
  clubId: string
  /** 공지 메시지 */
  message: string
}

/**
 * 공지 링크 컴포넌트
 * 커뮤니티 공지 페이지로 이동하는 링크를 렌더링합니다.
 */
function NotificationLink({ clubId, message }: NotificationLinkProps) {
  return (
    <Link
      href={ROUTES.COMMUNITY.NOTIFICATION(clubId)}
      className={styles['notification-link']}
      aria-label="커뮤니티 공지로 이동"
    >
      <span className={styles['notification-label']}>{MESSAGES.LABEL.NOTIFICATION}</span> {message}
    </Link>
  )
}

/**
 * 라운드 추가 링크 컴포넌트에 전달되는 속성
 */
interface AddRoundLinkProps {
  /** 커뮤니티 식별자 */
  clubId: string
}

/**
 * 라운드 추가 링크 컴포넌트
 * 라운드를 추가할 수 있는 페이지로 이동합니다.
 */
function AddRoundLink({ clubId }: AddRoundLinkProps) {
  return (
    <AccentLink href={ROUTES.COMMUNITY.ROUND(clubId)} aria-label="라운드 추가하기">
      {MESSAGES.ACTION.ADD_ROUND}
    </AccentLink>
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
}

/**
 * 커뮤니티 콘텐츠 컴포넌트 (클라이언트 컴포넌트)
 * 프로필, 공지, 라운드 목록 등 커뮤니티 상세 정보를 구성합니다.
 * 서버에서 받은 데이터로 전역 상태를 초기화합니다.
 */
export default function CommunityContent({ clubId, isTeamLeader }: CommunityContentProps) {
  const initializeCommunity = useCommunityStore(state => state.initializeCommunity)

  // 서버에서 받은 데이터로 전역 상태 초기화
  useEffect(() => {
    initializeCommunity(clubId, isTeamLeader)
  }, [clubId, isTeamLeader, initializeCommunity])

  return (
    <div className={styles['content-wrapper']}>
      <StudyProfile id={clubId} />
      <NotificationLink clubId={clubId} message="노트북 대여는 불가합니다" />
      <AddRoundLink clubId={clubId} />
      <RoundsList />
    </div>
  )
}
