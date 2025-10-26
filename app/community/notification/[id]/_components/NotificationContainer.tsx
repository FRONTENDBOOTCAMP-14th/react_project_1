'use client'

import { IconButton } from '@/components/ui'
import { useNotifications } from '@/lib/hooks'
import type { CustomSession } from '@/lib/types'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCommunityStore } from '../../../[id]/_hooks/useCommunityStore'
import { useSmartPin } from '../_hooks'
import NotificationCard from './NotificationCard'
import styles from './NotificationContainer.module.css'
import NotificationEditor from './NotificationEditor'

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

  const { smartTogglePin } = useSmartPin({ pinnedNotifications, togglePin })

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
          toast.error(pinResult.error || '고정 설정에 실패했습니다')
          return
        }
      }
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
    const result = await smartTogglePin(notificationId, currentPinned)
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
      <IconButton
        className={styles['add-button']}
        onClick={handleAddClick}
        disabled={!isTeamLeader || isEditing}
        title={!isTeamLeader ? '팀장 권한이 필요합니다' : '공지사항 작성'}
      >
        쓰기
      </IconButton>

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
