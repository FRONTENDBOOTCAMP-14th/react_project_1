import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import styles from './page.module.css'

export default async function DashboardPage() {
  const userId = await getCurrentUserId()
  if (!userId) {
    redirect('/login')
  }
  const user = await prisma.user.findUnique({ where: { userId } })
  return (
    <main className={styles.container}>
      <p>{user?.username} 님이 구독한 스터디 목록</p>
    </main>
  )
}
