import fonts from '@/app/fonts'
import '@/styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '토끼노트',
  description: '스터디 진행 관리/커뮤니티 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko-KR">
      <body className={fonts.pretendard.className}>
        <div style={{ minHeight: 'calc(100vh - 120px)' }}>
          <div>{children}</div>
        </div>
      </body>
    </html>
  )
}
