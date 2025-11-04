import { checkisAdmin, getCurrentUserId } from '@/lib/auth'
import NotificationContainer from './_components/NotificationContainer'

export default async function NotificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params
  const userId = await getCurrentUserId()
  const isAdmin = await checkisAdmin(userId, clubId)
  return <NotificationContainer clubId={clubId} userId={userId || ''} isAdmin={isAdmin} />
}
