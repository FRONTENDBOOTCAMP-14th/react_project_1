'use client'

import { updateProfileAction } from '@/app/actions/profile'
import { FillButton, StrokeButton } from '@/components/ui'
import { MESSAGES } from '@/constants'
import { useCallback, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { DeleteAccountButton, EditButton } from '.'
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
        toast.error(MESSAGES.ERROR.NAME_EMPTY_ERROR)
        return
      }

      startTransition(async () => {
        const result = await updateProfileAction({
          username: editForm.username,
          nickname: editForm.nickname || null,
        })

        if (result.success) {
          toast.success(MESSAGES.SUCCESS.PROFILE_UPDATE)
          setIsEditing(false)
          // revalidatePath가 자동으로 페이지 갱신
        } else {
          toast.error(result.error || MESSAGES.ERROR.PROFILE_UPDATE_ERROR)
        }
      })
    },
    [editForm.username, editForm.nickname]
  )

  if (isEditing) {
    return (
      <main className={styles.container}>
        <div className={styles['content']}>
          <h1 className={styles.title}>{MESSAGES.LABEL.PROFILE_EDIT}</h1>
          <form onSubmit={handleSaveEdit} className={styles.form}>
            <div className={styles['info-item']}>
              <span className={styles['info-label']}>{MESSAGES.LABEL.EMAIL}</span>
              <span className={`${styles['info-value']} ${styles['info-value-readonly']}`}>
                {user.email || '-'}
              </span>
            </div>
            <div className={styles['info-item']}>
              <label htmlFor="username" className={styles['info-label']}>
                {MESSAGES.LABEL.NAME_REQUIRED}
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
                {MESSAGES.LABEL.NICKNAME}
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
                {MESSAGES.ACTION.CANCEL}
              </StrokeButton>
              <FillButton className={button.button} type="submit" disabled={isPending}>
                {isPending ? MESSAGES.LABEL.SAVING : MESSAGES.LABEL.SAVE}
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
        <h1 className={styles.title}>{MESSAGES.LABEL.PROFILE}</h1>
        <div className={styles['info-row']}>
          <div className={styles['info-item']}>
            <span className={styles['info-label']}>{MESSAGES.LABEL.EMAIL}</span>
            <span className={styles['info-value']}>{user.email || '-'}</span>
          </div>
          <div className={styles['info-item']}>
            <span className={styles['info-label']}>{MESSAGES.LABEL.NAME}</span>
            <span className={styles['info-value']}>{user.username || '-'}</span>
          </div>
          <div className={styles['info-item']}>
            <span className={styles['info-label']}>{MESSAGES.LABEL.NICKNAME}</span>
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
