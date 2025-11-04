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

  // 삭제된 사용자는 로그인 페이지로 리다이렉트
  if (!user || user.deletedAt) {
    redirect('/login')
  }

  return <ProfileContent user={user} />
}
