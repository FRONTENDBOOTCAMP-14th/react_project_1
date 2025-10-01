'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

interface Props {
  id: string
  onDeleted?: () => void
}

export default function DeleteButton({ id, onDeleted }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setError(null)
    setLoading(true)

    try {
      const { error: deleteError } = await supabaseBrowser
        .from('communities')
        .update({ deleted_at: new Date().toISOString() })
        .eq('club_id', id)

      if (deleteError) {
        console.error('[DeleteButton] Delete error:', deleteError)
        setError(deleteError.message || '삭제 실패')
        return
      }

      onDeleted?.()
    } catch (err) {
      console.error('[DeleteButton] Unexpected error:', err)
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
      <button
        onClick={handleDelete}
        disabled={loading}
        style={{ padding: '6px 10px', fontSize: 12 }}
      >
        {loading ? '삭제 중...' : '삭제'}
      </button>
      {error && <span style={{ color: 'crimson', fontSize: 12 }}>{error}</span>}
    </div>
  )
}
