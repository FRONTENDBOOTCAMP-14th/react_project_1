import Button from '@/components/ui/Button'
import styles from './page.module.css'
import CommunityForm from './CommunityForm'
import DeleteButton from './DeleteButton'
import Link from 'next/link'
import type { CommunityListResponse, CommunityBase } from '@/lib/types/community'
import type { PaginationInfo } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Next.js Server Component에서 API Route 호출 (절대 URL 사용)
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/communities?limit=50`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch communities')
  }

  const result: CommunityListResponse = await response.json()

  const communities: CommunityBase[] = result.success && result.data ? result.data : []
  const paginationInfo: PaginationInfo | null = result.success ? result.pagination || null : null
  const itemCount: number = result.success ? result.count || 0 : 0
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
          {paginationInfo && (
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '8px' }}>
              총 {paginationInfo.total}개 중 {itemCount}개 표시 (페이지 {paginationInfo.page}/
              {paginationInfo.totalPages})
            </div>
          )}
          {communities.length === 0 ? (
            <p>아직 커뮤니티가 없습니다.</p>
          ) : (
            <ul style={{ display: 'grid', gap: 8 }}>
              {communities.map((c: CommunityBase) => (
                <li
                  key={c.clubId}
                  style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8 }}
                >
                  <Link
                    href={`/community/${c.clubId}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ fontWeight: 700, cursor: 'pointer', color: '#2563eb' }}>
                      {c.name}
                    </div>
                  </Link>
                  {c.description && <div style={{ color: '#6b7280' }}>{c.description}</div>}
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {c.isPublic ? '공개' : '비공개'} · {new Date(c.createdAt).toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <Button href={`/community/${c.clubId}`} variant="secondary">
                      상세보기
                    </Button>
                    <DeleteButton id={c.clubId} />
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
