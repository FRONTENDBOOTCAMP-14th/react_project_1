import type { Metadata } from 'next'
import fonts from '@/app/fonts'
import Footer from '@/components/common/Footer'
import Header from '@/components/common/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'Study Club Tracker',
  description: 'Next.js + Supabase 기반 스터디 진행 관리/커뮤니티 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <div className={fonts.pretendard.className} style={{ minHeight: 'calc(100vh - 120px)' }}>
          <div>{children}</div>
        </div>
        <Footer />
      </body>
    </html>
  )
}
