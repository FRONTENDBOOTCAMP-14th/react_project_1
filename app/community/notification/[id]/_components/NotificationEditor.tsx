import { Checkbox, FillButton, StrokeButton, TextInput } from '@/components/ui'
import { Check, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { MESSAGES } from '@/constants'
import styles from './NotificationEditor.module.css'

interface NotificationEditorProps {
  onSave: (title: string, content: string, isPinned: boolean) => Promise<void>
  onCancel: () => void
  isAdmin: boolean
  hasPinnedNotification: boolean
}

/**
 * 공지사항 작성 에디터 컴포넌트
 */
export default function NotificationEditor({
  onSave,
  onCancel,
  isAdmin,
  hasPinnedNotification,
}: NotificationEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // 마운트 시 제목 입력란에 포커스
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [])

  const handleSave = async () => {
    if (!title.trim()) return

    // 이미 고정 공지사항이 있는데 새로 고정하려는 경우 경고
    if (isPinned && hasPinnedNotification) {
      const confirmed = confirm(MESSAGES.ERROR.CONFIRM_PIN_REPLACE)
      if (!confirmed) {
        return
      }
    }

    setIsSaving(true)
    try {
      await onSave(title.trim(), content.trim(), isPinned)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSave()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <div className={styles.header}>
        <label htmlFor="notification-title">{MESSAGES.LABEL.NOTIFICATION_TITLE}</label>
        <TextInput
          ref={titleInputRef}
          id="notification-title"
          type="text"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder={MESSAGES.LABEL.NOTIFICATION_TITLE_PLACEHOLDER}
          className={styles['title-input']}
          disabled={isSaving}
          aria-label={MESSAGES.LABEL.NOTIFICATION_TITLE_LABEL}
        />
      </div>

      <div className={styles.body}>
        <label htmlFor="notification-content">{MESSAGES.LABEL.NOTIFICATION_CONTENT}</label>
        <textarea
          id="notification-content"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={MESSAGES.LABEL.NOTIFICATION_CONTENT_PLACEHOLDER}
          className={styles['content-input']}
          disabled={isSaving}
          rows={5}
          aria-label={MESSAGES.LABEL.NOTIFICATION_CONTENT_LABEL}
        />
      </div>

      <div className={styles.footer}>
        <Checkbox
          label={MESSAGES.LABEL.NOTIFICATION_PIN_TOP}
          checked={isPinned}
          onChange={setIsPinned}
          disabled={isSaving}
        />

        <div className={styles.actions}>
          <FillButton
            type="submit"
            disabled={!title.trim() || isSaving}
            className={styles['save-button']}
            aria-label={MESSAGES.ACTION.SAVE}
          >
            <Check size={16} />
            <span>{MESSAGES.ACTION.SAVE}</span>
          </FillButton>
          <StrokeButton
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className={styles['cancel-button']}
            aria-label={MESSAGES.ACTION.CANCEL}
          >
            <X size={16} />
            <span>{MESSAGES.ACTION.CANCEL}</span>
          </StrokeButton>
        </div>
      </div>
    </form>
  )
}
