'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { FillButton } from '@/components/ui'
import styles from './button.module.css'

export default function DeleteAccountButton() {
  const [loading, setLoading] = useState(false)

  const onDelete = async () => {
    if (loading) return
    const ok = window.confirm('정말로 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    if (!ok) return
    setLoading(true)
    try {
      const res = await fetch('/api/profile/delete', { method: 'POST' })
      if (!res.ok) {
        const t = await res.text()
        alert(`회원탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.\n${t}`)
        return
      }
      // 세션 종료 후 로그인 페이지로 이동
      await signOut({ callbackUrl: '/login' })
    } catch (_e) {
      alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FillButton className={styles.button} type="button" onClick={onDelete} disabled={loading}>
      {loading ? '처리 중…' : '회원탈퇴'}
    </FillButton>
  )
}
