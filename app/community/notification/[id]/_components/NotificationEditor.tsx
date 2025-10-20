import { useState, useRef, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { Checkbox } from '@/components/ui'
import styles from './NotificationEditor.module.css'

interface NotificationEditorProps {
  onSave: (title: string, content: string, isPinned: boolean) => Promise<void>
  onCancel: () => void
  isTeamLeader: boolean
  hasPinnedNotification: boolean
}

/**
 * 공지사항 작성 에디터 컴포넌트
 */
export default function NotificationEditor({
  onSave,
  onCancel,
  isTeamLeader,
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
      const confirmed = confirm(
        '이미 고정된 공지사항이 있습니다. 기존 고정을 해제하고 새로 고정하시겠습니까?'
      )
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  if (!isTeamLeader) {
    return null
  }

  return (
    <div className={styles.editor} onKeyDown={handleKeyDown}>
      <div className={styles.header}>
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="공지사항 제목을 입력하세요"
          className={styles['title-input']}
          disabled={isSaving}
          aria-label="공지사항 제목"
        />
      </div>

      <div className={styles.body}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="공지사항 내용을 입력하세요"
          className={styles['content-input']}
          disabled={isSaving}
          rows={5}
          aria-label="공지사항 내용"
        />
      </div>

      <div className={styles.footer}>
        <Checkbox label="상단 고정" checked={isPinned} onChange={setIsPinned} disabled={isSaving} />

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className={styles['save-button']}
            aria-label="저장"
          >
            <Check size={16} />
            <span>저장</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className={styles['cancel-button']}
            aria-label="취소"
          >
            <X size={16} />
            <span>취소</span>
          </button>
        </div>
      </div>
    </div>
  )
}
