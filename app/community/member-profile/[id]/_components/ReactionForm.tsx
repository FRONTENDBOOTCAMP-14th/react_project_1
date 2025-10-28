'use client'

import { StrokeButton } from '@/components/ui'
import { toast } from 'sonner'

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
        toast.success('리액션을 성공적으로 생성했습니다')
        window.location.reload()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error(`리액션 생성 중 오류가 발생했습니다: ${error}`)
    }
  }
  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSubmit}>
      <label htmlFor="reaction">댓글</label>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <input required type="text" id="reaction" name="reaction" />
        <StrokeButton style={{ padding: '0.5rem 1rem' }}>작성</StrokeButton>
      </div>
    </form>
  )
}
