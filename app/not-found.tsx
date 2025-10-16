'use client'

import { StrokeButton } from '@/components/ui'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <h1>페이지를 찾을 수 없습니다.</h1>
      <p>요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
      <div>
        <Link href="/">홈으로 돌아가기</Link>
        <StrokeButton onClick={() => globalThis.history.back()}>
          이전 페이지로 돌아가기
        </StrokeButton>
      </div>
    </div>
  )
}
