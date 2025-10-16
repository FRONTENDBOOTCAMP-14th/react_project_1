'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import StudyProfile from './_components/StudyProfile'
import RoundCard from './_components/RoundCard'
import styles from './page.module.css'
import { AccentLink } from '@/components/ui'

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
      href={`/community/notification/${clubId}`}
      className={styles['notification-link']}
      aria-label="커뮤니티 공지로 이동"
    >
      <span className={styles['notification-label']}>공지</span> {message}
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
    <AccentLink href={`/community/round/${clubId}`} aria-label="라운드 추가하기">
      라운드 추가
    </AccentLink>
  )
}

/**
 * 커뮤니티 콘텐츠 컴포넌트에 전달되는 속성
 */
interface CommunityContentProps {
  /** 커뮤니티 식별자 */
  clubId: string
}

/**
 * 커뮤니티 콘텐츠 컴포넌트
 * 프로필, 공지, 라운드 카드 등 커뮤니티 상세 정보를 구성합니다.
 */
function CommunityContent({ clubId }: CommunityContentProps) {
  return (
    <div className={styles['content-wrapper']}>
      <StudyProfile id={clubId} />
      <NotificationLink clubId={clubId} message="노트북 대여는 불가합니다" />
      <AddRoundLink clubId={clubId} />
      <RoundCard clubId={clubId} />
    </div>
  )
}

/**
 * 커뮤니티 상세 페이지
 * URL 파라미터에서 clubId를 추출해 하위 컴포넌트로 전달합니다.
 */
export default function Page() {
  const params = useParams()
  const idParam = params?.id
  const clubId = Array.isArray(idParam) ? idParam[0] : idParam

  if (!clubId) {
    return (
      <div className={styles.container}>
        <p>유효한 커뮤니티 ID가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <CommunityContent clubId={clubId} />
    </div>
  )
}
