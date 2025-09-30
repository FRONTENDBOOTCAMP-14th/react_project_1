import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Study Club Tracker</h1>
      <p>Next.js + Supabase 기반 스터디 진행 관리/커뮤니티 플랫폼</p>
      <p>
        <Link href="/dashboard">대시보드로 이동</Link>
      </p>
    </main>
  )
}
