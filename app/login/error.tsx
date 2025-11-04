'use client'

import { StrokeButton } from '@/components/ui'
import { useEffect } from 'react'
import { LoginForm } from './_components'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LoginError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Login error:', error)
  }, [error])

  return (
    <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
      <LoginForm />
      <div style={{ marginTop: 'var(--spacing-md)' }}>
        <p>로그인 페이지에서 오류가 발생했습니다.</p>
        <StrokeButton onClick={reset}>다시 시도</StrokeButton>
      </div>
    </div>
  )
}
