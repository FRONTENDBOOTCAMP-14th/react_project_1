'use client'

import { CommunityProvider } from '../_context/CommunityContext'
import type { CommunityContentProps } from '../types'
import CommunityLayout from './CommunityLayout'
import CommunitySection from './CommunitySection'
import NotificationLink from './NotificationLink'
import RoundsList from './RoundsList'
import StudyProfile from './StudyProfile'

/**
 * 커뮤니티 콘텐츠 컴포넌트
 * - Server Component에서 전달받은 권한 정보를 Context로 전달
 * - Server Component에서 전달받은 커뮤니티 데이터를 props로 전달
 * - 프로필, 공지, 라운드 목록 등을 렌더링
 */
export default function CommunityContent({
  clubId,
  isAdmin,
  isMember,
  community,
}: CommunityContentProps) {
  return (
    <CommunityProvider clubId={clubId} isAdmin={isAdmin} isMember={isMember}>
      <CommunityLayout clubId={clubId}>
        <CommunitySection title="커뮤니티 프로필" sectionId="profile">
          <StudyProfile id={clubId} community={community} />
        </CommunitySection>

        <CommunitySection title="커뮤니티 공지사항" sectionId="notifications">
          <NotificationLink clubId={clubId} notifications={community.notifications} />
        </CommunitySection>

        {(isAdmin || isMember) && (
          <CommunitySection title="스터디 회차" sectionId="rounds">
            <RoundsList clubId={clubId} rounds={community.rounds} />
          </CommunitySection>
        )}
      </CommunityLayout>
    </CommunityProvider>
  )
}
