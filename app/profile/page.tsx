import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ButtonContainer } from './_components'

export default async function ProfilePage() {
  const userId = await getCurrentUserId()
  if (!userId) {
    redirect('/login')
  }
  const user = await prisma.user.findUnique({ where: { userId } })
  if (!user) {
    redirect('/login')
  }

  return (
    <main style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '1rem',
          width: 'fit-content',
          alignSelf: 'center',
        }}
      >
        <h1 style={{ fontSize: 36 }}>프로필</h1>
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          <div>
            <div style={{ fontSize: 16 }}>이메일</div>
            <div style={{ fontSize: 16 }}>{user.email || '-'}</div>
          </div>
          <div>
            <div style={{ fontSize: 16, color: '#6b7280' }}>이름</div>
            <div style={{ fontSize: 16 }}>{user.username || '-'}</div>
          </div>
          <div>
            <div style={{ fontSize: 16, color: '#6b7280' }}>닉네임</div>
            <div style={{ fontSize: 16 }}>{user.nickname || '-'}</div>
          </div>
        </div>
        <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0' }} />
        <ButtonContainer />
      </div>
    </main>
  )
}
