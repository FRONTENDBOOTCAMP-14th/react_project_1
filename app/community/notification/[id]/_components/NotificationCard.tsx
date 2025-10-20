import type { Notification } from '@/lib/types/notification'
import { Pin, Trash2 } from 'lucide-react'
import styles from './NotificationCard.module.css'

interface NotificationCardProps {
  notification: Notification
  onDelete: (notificationId: string) => Promise<void>
  onTogglePin: (notificationId: string, currentPinned: boolean) => Promise<void>
  isTeamLeader: boolean
}

/**
 * 공지사항 카드 컴포넌트
 */
export default function NotificationCard({
  notification,
  onDelete,
  onTogglePin,
  isTeamLeader,
}: NotificationCardProps) {
  const { notificationId, title, content, isPinned, createdAt } = notification

  const handleDelete = () => {
    onDelete(notificationId)
  }

  const handleTogglePin = () => {
    onTogglePin(notificationId, isPinned)
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className={`${styles.card} ${isPinned ? styles.pinned : ''}`}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.title}>
          {isPinned && (
            <span className={styles['pin-badge']} aria-label="고정됨">
              <Pin size={14} />
            </span>
          )}
          <h3>{title}</h3>
        </div>

        {isTeamLeader && (
          <div className={styles.actions}>
            <button
              onClick={handleTogglePin}
              className={styles['action-button']}
              title={isPinned ? '고정 해제' : '상단 고정'}
              aria-label={isPinned ? '고정 해제' : '상단 고정'}
            >
              <Pin size={16} className={isPinned ? styles.active : ''} />
            </button>
            <button
              onClick={handleDelete}
              className={styles['action-button']}
              title="삭제"
              aria-label="삭제"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 내용 */}
      {content && (
        <div className={styles.content}>
          <p>{content}</p>
        </div>
      )}

      {/* 푸터 */}
      <div className={styles.footer}>
        <span className={styles.date}>{formatDate(createdAt)}</span>
      </div>
    </div>
  )
}
