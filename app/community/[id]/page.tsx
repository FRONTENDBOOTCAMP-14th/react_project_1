import { ROUTES } from '@/constants'
import { getCurrentUserId } from '@/lib/auth'
import { checkMembershipAndRole } from '@/lib/auth/permissions'
import { getCommunityDetail } from '@/lib/community/communityServer'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import CommunityContent from './_components/CommunityContent'

/**
 * 동적 Metadata 생성 - SEO 및 OG 태그 최적화
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id: clubId } = await params
  const community = await getCommunityDetail(clubId)

  if (!community) {
    return {
      title: '커뮤니티를 찾을 수 없습니다 | 토끼노트',
      description: '요청하신 커뮤니티를 찾을 수 없습니다.',
    }
  }

  const title = `${community.name} | 토끼노트`
  const description =
    community.description ||
    `${community.name} 스터디 커뮤니티입니다. ${community.region || ''} ${community.subRegion || ''}에서 활동 중입니다.`

  return {
    title,
    description,
  }
}

/**
 * 커뮤니티 상세 페이지 (서버 컴포넌트)
 * - 서버에서 커뮤니티 데이터 페칭
 * - 서버에서 사용자 인증 상태 확인
 * - 서버에서 팀장 권한 확인
 * - 모든 데이터를 클라이언트 컴포넌트에 props로 전달
 * - SEO 최적화: 서버에서 모든 콘텐츠 렌더링
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params

  // clubId 유효성 검증
  if (!clubId) {
    redirect(ROUTES.COMMUNITY.LIST)
  }

  // 서버에서 커뮤니티 데이터 페칭
  const community = await getCommunityDetail(clubId)

  // 커뮤니티가 없으면 목록으로 리다이렉트
  if (!community) {
    redirect(ROUTES.COMMUNITY.LIST)
  }

  // 서버에서 세션 확인
  const userId = await getCurrentUserId()

  // 한 번의 쿼리로 멤버십과 역할 확인
  const { isMember, isAdmin } = await checkMembershipAndRole(userId, clubId)

  return (
    <CommunityContent clubId={clubId} isAdmin={isAdmin} isMember={isMember} community={community} />
  )
}
