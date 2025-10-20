import NotificationContainer from './_components/NotificationContainer'

export default async function NotificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params

  return <NotificationContainer clubId={clubId} />
}
