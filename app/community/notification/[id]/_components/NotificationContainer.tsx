'use client'

import { IconButton } from '@/components/ui'
import { MESSAGES } from '@/constants'
import { useNotifications } from '@/lib/hooks'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSmartPin } from '../_hooks'
import NotificationCard from './NotificationCard'
import styles from './NotificationContainer.module.css'
import NotificationEditor from './NotificationEditor'

export default function NotificationContainer({
  clubId,
  userId,
  isAdmin,
}: {
  clubId: string
  userId: string
  isAdmin: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)

  const {
    notifications,
    pinnedNotifications,
    loading,
    error,
    createNotification,
    deleteNotification,
    togglePin,
  } = useNotifications({ clubId })

  const { smartTogglePin } = useSmartPin({ pinnedNotifications, togglePin })

  const handleAddClick = () => {
    if (!userId) {
      toast.error(MESSAGES.ERROR.LOGIN_REQUIRED)
      return
    }
    if (!isAdmin) {
      toast.error(MESSAGES.ERROR.ADMIN_REQUIRED)
      return
    }
    setIsEditing(true)
  }

  const handleSave = async (title: string, content: string, isPinned: boolean) => {
    if (!userId) {
      toast.error(MESSAGES.ERROR.LOGIN_REQUIRED)
      return
    }

    const result = await createNotification({
      authorId: userId,
      title,
      content,
      isPinned: false, // 먼저 고정하지 않고 생성
    })

    if (result.success) {
      // 생성 후 고정이 필요한 경우 스마트 토글 사용
      if (isPinned && result.data) {
        const pinResult = await smartTogglePin(result.data.notificationId, false)
        if (!pinResult.success) {
          toast.error(pinResult.error || MESSAGES.ERROR.NOTIFICATION_PIN_FAILED)
          return
        }
      }
      toast.success(MESSAGES.SUCCESS.NOTIFICATION_CREATE)
      setIsEditing(false)
    } else {
      toast.error(result.error || MESSAGES.ERROR.NOTIFICATION_CREATE_FAILED)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleDelete = async (notificationId: string) => {
    if (!confirm(MESSAGES.ERROR.CONFIRM_DELETE)) return

    const result = await deleteNotification(notificationId)
    if (result.success) {
      toast.success(MESSAGES.SUCCESS.NOTIFICATION_DELETE)
    } else {
      toast.error(result.error || MESSAGES.ERROR.NOTIFICATION_DELETE_FAILED)
    }
  }

  const handleTogglePin = async (notificationId: string, currentPinned: boolean) => {
    const result = await smartTogglePin(notificationId, currentPinned)
    if (result.success) {
      toast.success(
        currentPinned ? MESSAGES.SUCCESS.NOTIFICATION_UNPIN : MESSAGES.SUCCESS.NOTIFICATION_PIN
      )
    } else {
      toast.error(result.error || MESSAGES.ERROR.NOTIFICATION_PROCESS_FAILED)
    }
  }

  if (!userId) {
    return <div className={styles.message}>{MESSAGES.ERROR.LOGIN_REQUIRED}</div>
  }

  return (
    <div className={styles.container}>
      {/* 쓰기 버튼 */}
      <IconButton
        className={styles['add-button']}
        onClick={handleAddClick}
        disabled={!isAdmin || isEditing}
        title={!isAdmin ? MESSAGES.ERROR.ADMIN_REQUIRED : MESSAGES.LABEL.WRITE_NOTIFICATION}
      >
        {MESSAGES.ACTION.WRITE}
      </IconButton>

      <div className={styles.content}>
        {isEditing && (
          <NotificationEditor
            onSave={handleSave}
            onCancel={handleCancel}
            isAdmin={isAdmin}
            hasPinnedNotification={pinnedNotifications.length > 0}
          />
        )}

        {loading && <div className={styles.message}>{MESSAGES.LABEL.LOADING}</div>}

        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && notifications.length === 0 && (
          <div className={styles.message}>{MESSAGES.EMPTY.NO_NOTIFICATIONS}</div>
        )}

        {!loading &&
          !error &&
          notifications.map(notification => (
            <NotificationCard
              key={notification.notificationId}
              notification={notification}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              isAdmin={isAdmin}
            />
          ))}
      </div>
    </div>
  )
}
