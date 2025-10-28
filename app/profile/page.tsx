import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProfileContent } from './_components'

export default async function ProfilePage() {
  const userId = await getCurrentUserId()
  if (!userId) {
    redirect('/login')
  }
  const user = await prisma.user.findUnique({ where: { userId } })
  if (!user) {
    redirect('/login')
  }

  return <ProfileContent user={user} />
}
