import { checkIsTeamLeader, getCurrentUserId } from '@/lib/auth'
import NotificationContainer from './_components/NotificationContainer'

export default async function NotificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params
  const userId = await getCurrentUserId()
  const isTeamLeader = await checkIsTeamLeader(userId, clubId)
  return <NotificationContainer clubId={clubId} userId={userId || ''} isTeamLeader={isTeamLeader} />
}
