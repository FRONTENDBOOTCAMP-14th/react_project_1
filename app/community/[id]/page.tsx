import { ROUTES } from '@/constants'
import { getCurrentUserId } from '@/lib/auth'
import { checkMembershipAndRole } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import CommunityContent from './_components/CommunityContent'

/**
 * 커뮤니티 상세 페이지 (서버 컴포넌트)
 * - 서버에서 사용자 인증 상태 확인
 * - 서버에서 팀장 권한 확인
 * - 확인된 권한을 클라이언트 컴포넌트에 전달
 * - N+1 쿼리 최적화: 한 번의 쿼리로 멤버십과 역할 확인
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params

  // clubId 유효성 검증
  if (!clubId) {
    redirect(ROUTES.COMMUNITY.LIST)
  }

  // 서버에서 세션 확인
  const userId = await getCurrentUserId()

  // 한 번의 쿼리로 멤버십과 역할 확인
  const { isMember, isAdmin } = await checkMembershipAndRole(userId, clubId)

  return <CommunityContent clubId={clubId} isAdmin={isAdmin} isMember={isMember} />
}
