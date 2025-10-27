'use client'

import PersonalNotification from '@/app/notifications/PersonalNotification'
import styles from './page.module.css'

const MOCKUP_NOTIFICATION = [
  {
    id: 1,
    name: 'michel',
    message: '님이 회원님을 응원합니다',
    image: '/svg/logo.svg',
  },
  {
    id: 2,
    name: '회원',
    message: '님의 스터디가 30분 남았습니다',
    image: '/svg/logo.svg',
  },
]

export default function NotificationsPage() {
  const targetId = 2
  const notification = MOCKUP_NOTIFICATION.find(item => item.id === targetId)

  // 해당 id가 없을 경우 예외 처리
  if (!notification) {
    return <p className={styles.empty}>알림을 찾을 수 없습니다.</p>
  }
  return (
    <div className={styles.container}>
      <PersonalNotification
        name={notification.name}
        message={notification.message}
        image={notification.image}
        href={`/notifications/${notification.id}`}
      />
    </div>
  )
}
