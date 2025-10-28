import { formatDiffFromNow } from '@/lib/utils'

export default function MemberCard({ member }: { member: any }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        width: 'fit-content',
        alignItems: 'center',
        padding: '1rem',
        borderRadius: 'var(--inner-card-radius)',
        backgroundColor: 'var(--primary-color)',
        border: '1px solid var(--border-color)',
      }}
    >
      <h2>{member.user.nickname}</h2>
      <p>{member.role === 'admin' ? '관리자' : '멤버'}</p>
      <p>가입일: {formatDiffFromNow(member.joinedAt)}</p>
    </div>
  )
}
