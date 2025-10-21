import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import DeleteAccountButton from '@/app/profile/DeleteAccountButton'
import LogoutButton from '@/app/profile/LogoutButton'
import type { CustomSession } from '@/lib/types'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const userId = (session as CustomSession)?.userId
  if (!userId) {
    redirect('/login')
  }
  const user = await prisma.user.findUnique({ where: { userId } })
  if (!user) {
    redirect('/login')
  }

  return (
    <main
      style={{
        minHeight: 'calc(100dvh - 56px)',
        padding: '1rem',
        maxWidth: 640,
        margin: '0 auto',
        display: 'grid',
        gap: 12,
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>프로필</h1>
      <div style={{ display: 'grid', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>이메일</div>
          <div style={{ fontSize: 14 }}>{user.email || '-'}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>이름</div>
          <div style={{ fontSize: 14 }}>{user.username || '-'}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>닉네임</div>
          <div style={{ fontSize: 14 }}>{user.nickname || '-'}</div>
        </div>
      </div>
      <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <LogoutButton />
        <DeleteAccountButton />
      </div>
    </main>
  )
}
