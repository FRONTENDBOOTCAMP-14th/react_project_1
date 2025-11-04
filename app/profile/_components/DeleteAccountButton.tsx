'use client'

import { deleteAccountAction } from '@/app/actions/profile'
import { FillButton } from '@/components/ui'
import { signOut } from 'next-auth/react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import styles from './button.module.css'

export default function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition()

  const onDelete = async () => {
    if (isPending) return

    const ok = window.confirm('정말로 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    if (!ok) return

    startTransition(async () => {
      const result = await deleteAccountAction()

      if (result.success) {
        // Server Action에서 redirect('/login')이 실행되지만
        // 세션도 명시적으로 종료
        await signOut({ callbackUrl: '/login' })
      } else {
        toast.error(result.error || '회원탈퇴에 실패했습니다')
      }
    })
  }

  return (
    <FillButton className={styles.button} type="button" onClick={onDelete} disabled={isPending}>
      {isPending ? '처리 중…' : '회원탈퇴'}
    </FillButton>
  )
}
