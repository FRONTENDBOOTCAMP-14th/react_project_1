import Image from 'next/image'
import styles from './ProfileCard.module.css'

interface Member {
  id: string
  clubId: string
  userId: string
  role: string
  joinedAt: string
  user: {
    userId: string
    username: string
    email: string
    nickname: string | null
  }
}

interface ProfileCardProps {
  member: Member
}

export default function ProfileCard({ member }: ProfileCardProps) {
  const displayName = member.user.nickname || member.user.username

  // 역할 뱃지
  const roleLabel =
    {
      owner: '소유자',
      admin: '관리자',
      member: '멤버',
    }[member.role] || '멤버'

  // 역할별 CSS 클래스
  const getRoleBadgeClass = () => {
    switch (member.role) {
      case 'admin':
        return `${styles['role-badge']} ${styles['role-admin']}`
      default:
        return `${styles['role-badge']} ${styles['role-member']}`
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles['avatar-container']}>
        <Image src="/images/example.jpg" alt="" width={90} height={90} className={styles.avatar} />
      </div>
      <div className={styles.info}>
        <p className={styles['display-name']}>{displayName}</p>
        <p className={styles.username}>@{member.user.username}</p>
        <span className={getRoleBadgeClass()}>{roleLabel}</span>
      </div>
    </section>
  )
}
