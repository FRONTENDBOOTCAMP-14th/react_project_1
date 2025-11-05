import fonts from '@/app/fonts'
import Header from '@/components/common/Header'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import styles from './layout.module.css'
import Providers from './providers'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ),
  title: '토끼노트 - 스터디 커뮤니티',
  description:
    '스터디 그룹을 만들고 관리하세요. 다양한 커뮤니티에 참여하고 함께 성장하는 즐거움을 경험하세요.',
  icons: {
    icon: '/images/logo.png',
  },
  openGraph: {
    siteName: '토끼노트',
    type: 'website',
    locale: 'ko_KR',
  },
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
