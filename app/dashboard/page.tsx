import Button from '@/components/ui/Button'
import styles from './page.module.css'
import prisma from '@/lib/prisma'
import CommunityForm from './CommunityForm'
import DeleteButton from './DeleteButton'
import Link from 'next/link'
import type { CommunityWithDate } from '@/types/community'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // TODO: Prisma -> 페이지네이션 및 스킵 기능 추가 확인
  const communities: CommunityWithDate[] = await prisma.community.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: { clubId: true, name: true, description: true, isPublic: true, createdAt: true },
  })

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
          {communities.length === 0 ? (
            <p>아직 커뮤니티가 없습니다.</p>
          ) : (
            <ul style={{ display: 'grid', gap: 8 }}>
              {communities.map((c: CommunityWithDate) => (
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
