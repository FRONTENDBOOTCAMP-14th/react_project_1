import Image from 'next/image'
import { MESSAGES } from '@/constants'
import styles from './ProfileCard.module.css'
import Link from 'next/link'

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
      owner: MESSAGES.LABEL.ROLE_OWNER,
      admin: MESSAGES.LABEL.ROLE_ADMIN,
      member: MESSAGES.LABEL.ROLE_MEMBER,
    }[member.role] || MESSAGES.LABEL.ROLE_MEMBER

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
    <Link href={`/community/member-profile/${member.id}`} className={styles.card}>
      <div className={styles['avatar-container']}>
        <Image src="/images/example.jpg" alt="" width={90} height={90} className={styles.avatar} />
      </div>
      <div className={styles.info}>
        <p className={styles['display-name']}>{displayName}</p>
        <p className={styles.username}>@{member.user.username}</p>
        <span className={getRoleBadgeClass()}>{roleLabel}</span>
      </div>
    </Link>
  )
}
