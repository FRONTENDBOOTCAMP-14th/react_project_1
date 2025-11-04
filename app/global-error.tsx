'use client'

import { StrokeButton } from '@/components/ui'

/**
 * 전역 에러 처리 컴포넌트
 * - layout.tsx의 에러까지 잡는 최상위 에러 바운더리
 * - 전체 앱이 다운되는 것을 방지
 */
export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko-KR">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>앱에서 문제가 발생했습니다</h1>
          <p style={{ fontSize: '1rem', color: '#666' }}>
            일시적인 오류입니다. 잠시 후 다시 시도해주세요.
          </p>
          <StrokeButton onClick={() => reset()}>다시 시도</StrokeButton>
        </div>
      </body>
    </html>
  )
}
