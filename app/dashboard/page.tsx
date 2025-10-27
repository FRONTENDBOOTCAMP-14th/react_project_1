import prisma from '@/lib/prisma'
import type { CustomSession } from '@/lib/types'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/auth-options'
import styles from './page.module.css'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session as CustomSession)?.userId
  if (!userId) {
    redirect('/login')
  }
  const user = await prisma.user.findUnique({ where: { userId } })
  return (
    <main className={styles.container}>
      <p>{user?.username}</p>
    </main>
  )
}
