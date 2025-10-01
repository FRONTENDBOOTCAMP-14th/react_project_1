import Button from '@/components/ui/Button'
import styles from './page.module.css'
import CommunityList from './CommunityList'

export default function DashboardPage() {
  return (
    <main className={styles.container}>
      <h2 className={styles.title}>대시보드</h2>
      <p className={styles.subtitle}>커뮤니티 CRUD 테스트 UI</p>

      <section className={styles.section}>
        <div className={styles.actions}>
          <Button href="/">홈으로</Button>
          <Button href="/dashboard" variant="secondary">
            새로고침
          </Button>
        </div>

        <CommunityList />
      </section>
    </main>
  )
}
