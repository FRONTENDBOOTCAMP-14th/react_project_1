'use client'

import { StrokeButton } from '@/components/ui'
import { useEffect } from 'react'
import { LoginForm } from './_components'
import styles from './error.module.css'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LoginError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Login error:', error)
  }, [error])

  return (
    <div className={styles.container}>
      <LoginForm />
      <div className={styles.errorSection}>
        <p>로그인 페이지에서 오류가 발생했습니다.</p>
        <StrokeButton onClick={reset}>다시 시도</StrokeButton>
      </div>
    </div>
  )
}
