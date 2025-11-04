'use client'

import { useEffect } from 'react'
import StudyProfile from './StudyProfile'
import RoundsList from './RoundsList'
import CommunityLayout from './CommunityLayout'
import CommunitySection from './CommunitySection'
import NotificationLink from './NotificationLink'
import { useCommunityStore } from '../_hooks/useCommunityStore'

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
    <CommunityLayout clubId={clubId}>
      <CommunitySection title="커뮤니티 프로필" sectionId="profile">
        <StudyProfile id={clubId} />
      </CommunitySection>

      <CommunitySection title="커뮤니티 공지사항" sectionId="notifications">
        <NotificationLink clubId={clubId} />
      </CommunitySection>

      {(isTeamLeader || isMember) && (
        <CommunitySection title="스터디 회차" sectionId="rounds">
          <RoundsList clubId={clubId} />
        </CommunitySection>
      )}
    </CommunityLayout>
  )
}
