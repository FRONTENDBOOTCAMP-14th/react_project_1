'use client'

import { useEffect } from 'react'
import { DashboardLayout } from './_components'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <DashboardLayout
      title="오류가 발생했습니다"
      emptyMessage="대시보드를 불러오는 중 오류가 발생했습니다."
      isEmpty={true}
    >
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--spacing-lg)',
        }}
      >
        <p>다시 시도해주세요.</p>
        <button
          onClick={reset}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--inner-card-radius)',
            cursor: 'pointer',
            marginTop: 'var(--spacing-md)',
          }}
        >
          다시 시도
        </button>
      </div>
    </DashboardLayout>
  )
}
