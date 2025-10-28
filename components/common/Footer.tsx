import Styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={Styles.footer}>
      <nav className={Styles.inner}>
        <a href="" target="_blank">
          e-mail
        </a>
        |
        <a href="" target="_blank">
          Blog
        </a>
        |
        <a href="" target="_blank">
          Github
        </a>
      </nav>
      <p className={Styles.text}>
        <span>© {year} Tokki Study Club Tracker</span>
        <span>Built with Next.js + Supabase</span>
        <span>멋사 부트캠프 14기 파이널프로젝트 1조</span>
        <span>Copyright 2025. cocoder. All Rights Reserved.</span>
      </p>
    </footer>
  )
}
