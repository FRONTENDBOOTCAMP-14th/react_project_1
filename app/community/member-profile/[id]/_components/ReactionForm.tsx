'use client'

import { IconButton } from '@/components/ui'
import { SendHorizonal } from 'lucide-react'
import { toast } from 'sonner'
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
      toast.loading('리액션을 생성 중입니다')
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
        toast.success('리액션을 성공적으로 생성했습니다')
        // Next.js 방식으로 페이지 새로고침
        const { revalidatePath } = await import('next/cache')
        revalidatePath(`/community/member-profile/${memberId}`)
      } else {
        toast.dismiss()
        throw new Error(data.error)
      }
    } catch (error) {
      toast.dismiss()
      toast.error(`리액션 생성 중 오류가 발생했습니다: ${error}`)
    }
  }
  return (
    <form className={styles['reaction-form']} onSubmit={handleSubmit}>
      <label className={styles['label']} htmlFor="reaction">
        댓글
      </label>
      <div className={styles['input-container']}>
        <input
          required
          placeholder="응원과 칭찬의 메세지를 남겨주세요"
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
