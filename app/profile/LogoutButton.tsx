'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const onLogout = async () => {
    if (loading) return
    setLoading(true)
    try {
      await signOut({ callbackUrl: '/' })
    } finally {
      setLoading(false)
    }
  }
  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      style={{
        height: 44,
        padding: '0 16px',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        color: '#111827',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? '로그아웃 중…' : '로그아웃'}
    </button>
  )
}
