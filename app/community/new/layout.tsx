import fonts from '@/app/fonts'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import styles from './layout.module.css'

export const metadata: Metadata = {
  title: '토끼노트',
  description: '스터디 진행 관리/커뮤니티 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles['main-wrapper']}>
      <div>{children}</div>
    </div>
  )
}
