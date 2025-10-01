'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import CommunityForm from './CommunityForm'
import DeleteButton from './DeleteButton'

type Community = Database['public']['Tables']['communities']['Row']

export default function CommunityList() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabaseBrowser
        .from('communities')
        .select(
          'club_id, name, description, is_public, created_at, updated_at, deleted_at, tagname'
        )
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('[CommunityList] Fetch error:', fetchError)
        setError('커뮤니티 목록을 불러오는데 실패했습니다.')
        return
      }

      setCommunities(data ?? [])
    } catch (err) {
      console.error('[CommunityList] Unexpected error:', err)
      setError('알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunities()
  }, [])

  const handleCreated = () => {
    fetchCommunities()
  }

  const handleDeleted = () => {
    fetchCommunities()
  }

  if (loading) {
    return <p>로딩 중...</p>
  }

  if (error) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <p style={{ color: 'crimson' }}>{error}</p>
        <button onClick={fetchCommunities} style={{ padding: '8px 12px', maxWidth: 120 }}>
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'grid', gap: 12 }}>
        <h3>커뮤니티 생성</h3>
        <CommunityForm onCreated={handleCreated} />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <h3>커뮤니티 목록</h3>
        {communities.length === 0 ? (
          <p>아직 커뮤니티가 없습니다.</p>
        ) : (
          <ul style={{ display: 'grid', gap: 8 }}>
            {communities.map(community => (
              <li
                key={community.club_id}
                style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8 }}
              >
                <div style={{ fontWeight: 700 }}>{community.name}</div>
                {community.description && (
                  <div style={{ color: '#6b7280' }}>{community.description}</div>
                )}
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {community.is_public ? '공개' : '비공개'} ·{' '}
                  {new Date(community.created_at).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div style={{ marginTop: 8 }}>
                  <DeleteButton id={community.club_id} onDeleted={handleDeleted} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
