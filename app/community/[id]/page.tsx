import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { checkIsTeamLeader } from '@/lib/auth/permissions'
import CommunityContent from './_components/CommunityContent'
import { ROUTES } from '@/constants'
import type { CustomSession } from '@/lib/types'

/**
 * 커뮤니티 상세 페이지 (서버 컴포넌트)
 * - 서버에서 사용자 인증 상태 확인
 * - 서버에서 팀장 권한 확인
 * - 확인된 권한을 클라이언트 컴포넌트에 전달
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params

  // clubId 유효성 검증
  if (!clubId) {
    redirect(ROUTES.COMMUNITY.LIST)
  }

  // 서버에서 세션 확인
  const session = await getServerSession(authOptions)
  const userId = (session as CustomSession)?.userId

  // 서버에서 팀장 권한 확인
  const isTeamLeader = await checkIsTeamLeader(userId, clubId)

  return <CommunityContent clubId={clubId} isTeamLeader={isTeamLeader} />
}
