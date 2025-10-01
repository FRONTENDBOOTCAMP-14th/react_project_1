'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  onCreated?: () => void
}

interface Error {
  message: string
}

export default function CommunityForm({ onCreated }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('이름을 입력하세요')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, is_public: isPublic }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || '생성 실패')

      // reset and notify
      setName('')
      setDescription('')
      setIsPublic(true)
      onCreated?.()
      router.refresh()
    } catch (err: unknown) {
      setError((err as Error)?.message ?? '알 수 없는 오류')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
      <div>
        <label style={{ display: 'block', fontWeight: 600 }}>커뮤니티 이름</label>
        <input
          type="text"
          placeholder="예: FE Study"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600 }}>설명</label>
        <textarea
          placeholder="커뮤니티 소개를 입력하세요"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: 8 }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          id="is_public"
          type="checkbox"
          checked={isPublic}
          onChange={e => setIsPublic(e.target.checked)}
        />
        <label htmlFor="is_public">공개 커뮤니티</label>
      </div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
        {loading ? '저장 중...' : '생성하기'}
      </button>
    </form>
  )
}
