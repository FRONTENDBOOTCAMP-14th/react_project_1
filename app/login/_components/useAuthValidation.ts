'use client'

import { checkEmailAction, checkNicknameAction } from '@/app/actions/auth'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export type ValidationStatus = 'idle' | 'checking' | 'available' | 'taken'

export function useAuthValidation() {
  const [emailStatus, setEmailStatus] = useState<ValidationStatus>('idle')
  const [nicknameStatus, setNicknameStatus] = useState<ValidationStatus>('idle')

  const checkEmail = useCallback(async (email: string): Promise<boolean> => {
    if (!email) {
      setEmailStatus('idle')
      return false
    }

    setEmailStatus('checking')

    try {
      const result = await checkEmailAction({ email })

      if (result.success && result.data?.available) {
        setEmailStatus('available')
        toast.success('사용 가능한 이메일입니다.')
        return true
      }

      setEmailStatus('taken')
      toast.error('이미 사용 중인 이메일입니다.')
      return false
    } catch (_error) {
      setEmailStatus('idle')
      toast.error('이메일 확인에 실패했습니다.')
      return false
    }
  }, [])

  const checkNickname = useCallback(async (nickname: string): Promise<boolean> => {
    if (!nickname) {
      setNicknameStatus('idle')
      return false
    }

    setNicknameStatus('checking')

    try {
      const result = await checkNicknameAction({ nickname })

      if (result.success && result.data?.available) {
        setNicknameStatus('available')
        toast.success('사용 가능한 닉네임입니다.')
        return true
      }

      setNicknameStatus('taken')
      toast.error('이미 사용 중인 닉네임입니다.')
      return false
    } catch (_error) {
      setNicknameStatus('idle')
      toast.error('닉네임 확인에 실패했습니다.')
      return false
    }
  }, [])

  const resetEmailStatus = useCallback(() => {
    setEmailStatus('idle')
  }, [])

  const resetNicknameStatus = useCallback(() => {
    setNicknameStatus('idle')
  }, [])

  return {
    emailStatus,
    nicknameStatus,
    checkEmail,
    checkNickname,
    resetEmailStatus,
    resetNicknameStatus,
  }
}
