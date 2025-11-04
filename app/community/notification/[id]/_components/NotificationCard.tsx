import { IconButton } from '@/components/ui'
import type { Notification } from '@/lib/types/notification'
import { formatDate } from '@/lib/utils'
import { Pin, Trash2 } from 'lucide-react'
import { memo, useCallback } from 'react'
import styles from './NotificationCard.module.css'

interface NotificationCardProps {
  notification: Notification
  onDelete: (notificationId: string) => Promise<void>
  onTogglePin: (notificationId: string, currentPinned: boolean) => Promise<void>
  isAdmin: boolean
}

/**
 * 공지사항 카드 컴포넌트
 * 메모이제이션을 통해 불필요한 리렌더링 방지
 */
function NotificationCard({ notification, onDelete, onTogglePin, isAdmin }: NotificationCardProps) {
  const { notificationId, title, content, isPinned, createdAt } = notification

  const handleDelete = useCallback(() => {
    onDelete(notificationId)
  }, [notificationId, onDelete])

  const handleTogglePin = useCallback(() => {
    onTogglePin(notificationId, isPinned)
  }, [notificationId, isPinned, onTogglePin])

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

        {isAdmin && (
          <div className={styles.actions}>
            <IconButton
              onClick={handleTogglePin}
              title={isPinned ? '고정 해제' : '상단 고정'}
              aria-label={isPinned ? '고정 해제' : '상단 고정'}
            >
              <Pin size={16} className={isPinned ? styles.active : ''} />
            </IconButton>
            <IconButton onClick={handleDelete} title="삭제" aria-label="삭제">
              <Trash2 size={16} />
            </IconButton>
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

export default memo(NotificationCard)
