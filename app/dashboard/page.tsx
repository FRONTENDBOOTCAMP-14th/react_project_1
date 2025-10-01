import Button from '@/components/ui/Button'
import styles from './page.module.css'
import { supabaseServer } from '@/lib/supabase/server'
import CommunityForm from './CommunityForm'
import DeleteButton from './DeleteButton'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Supabase query with RLS-aware filtering
  // Type is automatically inferred from the select clause
  const { data: communities, error } = await supabaseServer
    .from('communities')
    .select('club_id, name, description, is_public, created_at, tagname')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[DashboardPage] Failed to fetch communities:', error)
    return (
      <main className={styles.container}>
        <h2 className={styles.title}>대시보드</h2>
        <p style={{ color: 'red' }}>커뮤니티 목록을 불러오는데 실패했습니다.</p>
      </main>
    )
  }

  const communityList = communities ?? []

  return (
    <main className={styles.container}>
      <h2 className={styles.title}>대시보드</h2>
      <p className={styles.subtitle}>커뮤니티 CRUD 테스트 UI</p>

      <section style={{ display: 'grid', gap: 16, marginTop: 16 }}>
        <div className={styles.actions}>
          <Button href="/">홈으로</Button>
          <Button href="/dashboard" variant="secondary">
            새로고침
          </Button>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <h3>커뮤니티 생성</h3>
          <CommunityForm />
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <h3>커뮤니티 목록</h3>
          {communityList.length === 0 ? (
            <p>아직 커뮤니티가 없습니다.</p>
          ) : (
            <ul style={{ display: 'grid', gap: 8 }}>
              {communityList.map(community => (
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
                    <DeleteButton id={community.club_id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}
