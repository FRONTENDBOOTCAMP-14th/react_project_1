import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>© {year} Study Club Tracker</span>
        <span>Built with Next.js + Supabase</span>
      </div>
    </footer>
  )
}
