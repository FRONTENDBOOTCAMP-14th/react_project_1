'use client'

import NotificationCard from './NotificationCard'
import NotificationEditor from './NotificationEditor'
import { useSession } from 'next-auth/react'
import type { CustomSession } from '@/lib/types'
import { useCommunityStore } from '../../../[id]/_hooks/useCommunityStore'
import { toast } from 'sonner'
import { useState } from 'react'
import { useNotifications } from '@/lib/hooks'
import styles from './NotificationContainer.module.css'

export default function NotificationContainer({ clubId }: { clubId: string }) {
  const { data: session } = useSession()
  const userId = (session as CustomSession)?.userId
  const isTeamLeader = useCommunityStore(state => state.isTeamLeader)
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

  const handleAddClick = () => {
    if (!userId) {
      toast.error('로그인이 필요합니다')
      return
    }
    if (!isTeamLeader) {
      toast.error('팀장 권한이 필요합니다')
      return
    }
    setIsEditing(true)
  }

  const handleSave = async (title: string, content: string, isPinned: boolean) => {
    if (!userId) {
      toast.error('로그인이 필요합니다')
      return
    }

    // 고정 공지사항을 생성하려는 경우, 기존 고정 공지사항 먼저 해제
    if (isPinned && pinnedNotifications.length > 0) {
      const existingPinned = pinnedNotifications[0]
      const unpinResult = await togglePin(existingPinned.notificationId, true)
      if (!unpinResult.success) {
        toast.error('기존 고정 공지사항 해제에 실패했습니다')
        return
      }
    }

    const result = await createNotification({
      authorId: userId,
      title,
      content,
      isPinned,
    })

    if (result.success) {
      toast.success('공지사항이 작성되었습니다')
      setIsEditing(false)
    } else {
      toast.error(result.error || '공지사항 작성에 실패했습니다')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleDelete = async (notificationId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const result = await deleteNotification(notificationId)
    if (result.success) {
      toast.success('공지사항이 삭제되었습니다')
    } else {
      toast.error(result.error || '삭제에 실패했습니다')
    }
  }

  const handleTogglePin = async (notificationId: string, currentPinned: boolean) => {
    // 고정하려는 경우 (false → true)
    if (!currentPinned) {
      // 이미 고정된 다른 공지사항이 있는지 확인
      const existingPinned = pinnedNotifications.find(n => n.notificationId !== notificationId)

      if (existingPinned) {
        // 기존 고정 공지사항 먼저 해제
        const unpinResult = await togglePin(existingPinned.notificationId, true)
        if (!unpinResult.success) {
          toast.error('기존 고정 공지사항 해제에 실패했습니다')
          return
        }
      }
    }

    // 현재 공지사항 고정/해제
    const result = await togglePin(notificationId, currentPinned)
    if (result.success) {
      toast.success(currentPinned ? '고정 해제되었습니다' : '상단에 고정되었습니다')
    } else {
      toast.error(result.error || '처리에 실패했습니다')
    }
  }

  if (!userId) {
    return <div className={styles.message}>로그인이 필요합니다</div>
  }

  return (
    <div className={styles.container}>
      {/* 쓰기 버튼 */}
      <button
        className={styles['add-button']}
        onClick={handleAddClick}
        disabled={!isTeamLeader || isEditing}
        title={!isTeamLeader ? '팀장 권한이 필요합니다' : '공지사항 작성'}
      >
        쓰기
      </button>

      {/* 공지사항 목록 */}
      <div className={styles.content}>
        {/* 편집 모드 */}
        {isEditing && (
          <NotificationEditor
            onSave={handleSave}
            onCancel={handleCancel}
            isTeamLeader={isTeamLeader}
            hasPinnedNotification={pinnedNotifications.length > 0}
          />
        )}

        {/* 로딩 */}
        {loading && <div className={styles.message}>로딩 중...</div>}

        {/* 에러 */}
        {error && <div className={styles.error}>{error}</div>}

        {/* 공지사항 목록 */}
        {!loading && !error && notifications.length === 0 && (
          <div className={styles.message}>작성된 공지사항이 없습니다</div>
        )}

        {!loading &&
          !error &&
          notifications.map(notification => (
            <NotificationCard
              key={notification.notificationId}
              notification={notification}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              isTeamLeader={isTeamLeader}
            />
          ))}
      </div>
    </div>
  )
}
