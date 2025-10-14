import fonts from '@/app/fonts'
import Footer from '@/components/common/Footer'
import Header from '@/components/common/Header'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import Providers from './providers'

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
          <div style={{ minHeight: 'calc(100vh - 120px)' }}>
            <div>{children}</div>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
