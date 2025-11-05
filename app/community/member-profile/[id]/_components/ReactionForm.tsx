'use client'

import { IconButton } from '@/components/ui'
import { SendHorizonal } from 'lucide-react'
import { toast } from 'sonner'
import { MESSAGES } from '@/constants'
import styles from './ReactionForm.module.css'
interface ReactionFormProps {
  memberId: string
}

export default function ReactionForm({ memberId }: ReactionFormProps) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const reaction = formData.get('reaction')
    if (!reaction || !memberId) {
      return
    }
    try {
      toast.loading(MESSAGES.LOADING.REACTION_CREATING)
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reaction,
          memberId,
        }),
      })
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      const data = await response.json()

      if (data.success) {
        toast.dismiss()
        toast.success(MESSAGES.SUCCESS.REACTION_CREATE)
        // Next.js 방식으로 페이지 새로고침
        const { revalidatePath } = await import('next/cache')
        revalidatePath(`/community/member-profile/${memberId}`)
      } else {
        toast.dismiss()
        throw new Error(data.error)
      }
    } catch (error) {
      toast.dismiss()
      toast.error(`${MESSAGES.ERROR.REACTION_CREATE_FAILED}: ${error}`)
    }
  }
  return (
    <form className={styles['reaction-form']} onSubmit={handleSubmit}>
      <label className={styles['label']} htmlFor="reaction">
        {MESSAGES.LABEL.COMMENT}
      </label>
      <div className={styles['input-container']}>
        <input
          required
          placeholder={MESSAGES.LABEL.REACTION_PLACEHOLDER}
          type="text"
          id="reaction"
          name="reaction"
          className={styles['input']}
        />
        <IconButton type="submit">
          <SendHorizonal size={30} strokeWidth={1} />
        </IconButton>
      </div>
    </form>
  )
}
