import Link from 'next/link'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link className={styles.link} href="/">
            Study Club Tracker
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link className={styles.link} href="/dashboard">
            대시보드
          </Link>
          <Link className={styles.link} href="/api/health">
            헬스체크
          </Link>
        </nav>
      </div>
    </header>
  )
}
