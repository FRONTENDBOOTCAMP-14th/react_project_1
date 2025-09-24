import styles from './page.module.css'
import Button from '@/components/ui/Button'

export default function DashboardPage() {
  return (
    <main className={styles.container}>
      <h2 className={styles.title}>대시보드</h2>
      <p className={styles.subtitle}>개인/팀 진행 상황을 한눈에 확인하세요.</p>
      <div className={styles.actions}>
        <Button href="/">홈으로</Button>
        <Button href="/dashboard" variant="secondary">
          새로고침
        </Button>
      </div>
    </main>
  )
}
