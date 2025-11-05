import type { Metadata } from 'next'
import NotificationList from './NotificationList'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: '알림 | 토끼노트',
  description: '새로운 알림과 업데이트를 확인하세요.',
  openGraph: {
    title: '알림 | 토끼노트',
    description: '새로운 알림과 업데이트를 확인하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotificationsPage() {
  return (
    <div className={styles.container}>
      <NotificationList />
    </div>
  )
}
