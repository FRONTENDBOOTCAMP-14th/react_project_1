'use client'

import { deleteAccountAction } from '@/app/actions/profile'
import { FillButton } from '@/components/ui'
import { MESSAGES } from '@/constants'
import { signOut } from 'next-auth/react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import styles from './button.module.css'

export default function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition()

  const onDelete = async () => {
    if (isPending) return

    const ok = window.confirm(MESSAGES.LABEL.DELETE_ACCOUNT_CONFIRM)
    if (!ok) return

    startTransition(async () => {
      const result = await deleteAccountAction()

      if (result.success) {
        // Server Action에서 redirect('/login')이 실행되지만
        // 세션도 명시적으로 종료
        await signOut({ callbackUrl: '/login' })
      } else {
        toast.error(result.error || MESSAGES.ERROR.DELETE_ACCOUNT_FAILED)
      }
    })
  }

  return (
    <FillButton className={styles.button} type="button" onClick={onDelete} disabled={isPending}>
      {isPending ? MESSAGES.LABEL.DELETING_ACCOUNT : MESSAGES.LABEL.DELETE_ACCOUNT}
    </FillButton>
  )
}
