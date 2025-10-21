import fonts from '@/app/fonts'
import Header from '@/components/common/Header'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import Providers from './providers'
import styles from './layout.module.css'

export const metadata: Metadata = {
  title: '토끼노트',
  description: '스터디 진행 관리/커뮤니티 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko-KR">
      <body className={fonts.pretendard.className}>
        <Providers>
          <Header />
          <div className={styles.container}>
            <div className={styles.content}>{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
