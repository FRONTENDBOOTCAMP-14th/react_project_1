'use client'

import { useState, useCallback, useTransition } from 'react'
import { updateProfileAction } from '@/app/actions/profile'
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
  const [isPending, startTransition] = useTransition()
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

      startTransition(async () => {
        const result = await updateProfileAction({
          username: editForm.username,
          nickname: editForm.nickname || null,
        })

        if (result.success) {
          toast.success('프로필이 수정되었습니다')
          setIsEditing(false)
          // revalidatePath가 자동으로 페이지 갱신
        } else {
          toast.error(result.error || '프로필 수정에 실패했습니다')
        }
      })
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
                disabled={isPending}
              >
                취소
              </StrokeButton>
              <FillButton className={button.button} type="submit" disabled={isPending}>
                {isPending ? '저장 중...' : '저장'}
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
