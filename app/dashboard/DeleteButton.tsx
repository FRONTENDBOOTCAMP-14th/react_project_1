'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { id: string }

export default function DeleteButton({ id }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDelete = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/communities?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || '삭제 실패')
      router.refresh()
    } catch (e: any) {
      setError(e?.message ?? '알 수 없는 오류')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
      <button onClick={onDelete} disabled={loading} style={{ padding: '6px 10px', fontSize: 12 }}>
        {loading ? '삭제 중...' : '삭제'}
      </button>
      {error && <span style={{ color: 'crimson', fontSize: 12 }}>{error}</span>}
    </div>
  )
}
