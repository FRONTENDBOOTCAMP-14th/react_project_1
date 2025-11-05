'use client'

import { useEffect } from 'react'
import { MESSAGES } from '@/constants'
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
      title={MESSAGES.DASHBOARD.ERROR_TITLE}
      emptyMessage={MESSAGES.ERROR.DASHBOARD_LOAD_FAILED}
      isEmpty={true}
    >
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--spacing-lg)',
        }}
      >
        <p>{MESSAGES.DASHBOARD.RETRY_MESSAGE}</p>
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
          {MESSAGES.ACTION.RETRY}
        </button>
      </div>
    </DashboardLayout>
  )
}
