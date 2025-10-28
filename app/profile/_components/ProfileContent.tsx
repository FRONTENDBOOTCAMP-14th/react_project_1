'use client'

import { useState, useCallback } from 'react'
import { DeleteAccountButton, EditButton } from '.'
import { toast } from 'sonner'
import { StrokeButton, FillButton } from '@/components/ui'
import styles from './ProfileContent.module.css'
import button from './button.module.css'

interface User {
  userId: string
  username: string
  email: string | null
  nickname: string | null
}

interface ProfileContentProps {
  user: User
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    username: user.username,
    nickname: user.nickname || '',
  })

  const handleEditClick = useCallback(() => {
    setEditForm({
      username: user.username,
      nickname: user.nickname || '',
    })
    setIsEditing(true)
  }, [user.username, user.nickname])

  const handleCancelEdit = useCallback(() => {
    setEditForm({
      username: user.username,
      nickname: user.nickname || '',
    })
    setIsEditing(false)
  }, [user.username, user.nickname])

  const handleSaveEdit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!editForm.username.trim()) {
        toast.error('이름을 입력해주세요')
        return
      }

      setIsLoading(true)

      try {
        const response = await fetch('/api/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: editForm.username.trim(),
            nickname: editForm.nickname.trim() || null,
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          toast.success('프로필이 수정되었습니다')
          setIsEditing(false)
          // 페이지 새로고침으로 업데이트된 데이터 반영
          window.location.reload()
        } else {
          toast.error(data.error || '프로필 수정에 실패했습니다')
        }
      } catch (error) {
        console.error('Failed to update profile:', error)
        toast.error('프로필 수정 중 오류가 발생했습니다')
      } finally {
        setIsLoading(false)
      }
    },
    [editForm.username, editForm.nickname]
  )

  if (isEditing) {
    return (
      <main className={styles.container}>
        <div className={styles['content']}>
          <h1 className={styles.title}>프로필 편집</h1>
          <form onSubmit={handleSaveEdit} className={styles.form}>
            <div className={styles['info-item']}>
              <span className={styles['info-label']}>이메일</span>
              <span className={`${styles['info-value']} ${styles['info-value-readonly']}`}>
                {user.email || '-'}
              </span>
            </div>
            <div className={styles['info-item']}>
              <label htmlFor="username" className={styles['info-label']}>
                이름 *
              </label>
              <input
                id="username"
                type="text"
                value={editForm.username}
                onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                required
                className={styles.input}
              />
            </div>
            <div className={styles['info-item']}>
              <label htmlFor="nickname" className={styles['info-label']}>
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                value={editForm.nickname}
                onChange={e => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                className={styles.input}
              />
            </div>
            <div className={styles['divider']} />
            <div className={styles['button-group']}>
              <StrokeButton
                className={button.button}
                type="button"
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                취소
              </StrokeButton>
              <FillButton className={button.button} type="submit" disabled={isLoading}>
                {isLoading ? '저장 중...' : '저장'}
              </FillButton>
            </div>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>프로필</h1>
        <div className={styles['info-row']}>
          <div className={styles['info-item']}>
            <span className={styles['info-label']}>이메일</span>
            <span className={styles['info-value']}>{user.email || '-'}</span>
          </div>
          <div className={styles['info-item']}>
            <span className={styles['info-label']}>이름</span>
            <span className={styles['info-value']}>{user.username || '-'}</span>
          </div>
          <div className={styles['info-item']}>
            <span className={styles['info-label']}>닉네임</span>
            <span className={styles['info-value']}>{user.nickname || '-'}</span>
          </div>
        </div>
        <div className={styles['divider']} />
        <div className={styles['button-group']}>
          <EditButton onClick={handleEditClick} />
          <DeleteAccountButton />
        </div>
      </div>
    </main>
  )
}
