'use client'

import { registerAction } from '@/app/actions/auth'
import { MESSAGES } from '@/constants'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import styles from './page.module.css'
import { useAuthValidation } from './useAuthValidation'

interface RegisterFormData {
  email: string
  username: string
  nickname: string
}

interface FormErrors {
  email?: string
  nickname?: string
  form?: string
}

export function RegisterForm() {
  const search = useSearchParams()
  const providerId = search.get('providerId') || ''
  const emailFromQuery = search.get('email') || ''

  const [formData, setFormData] = React.useState<RegisterFormData>({
    email: emailFromQuery,
    username: '',
    nickname: '',
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [loading, setLoading] = React.useState(false)

  const {
    emailStatus,
    nicknameStatus,
    checkEmail,
    checkNickname,
    resetEmailStatus,
    resetNicknameStatus,
  } = useAuthValidation()

  const handleInputChange = React.useCallback(
    (field: keyof RegisterFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }))

      // Reset validation status when user types
      if (field === 'email') {
        resetEmailStatus()
        setErrors(prev => ({ ...prev, email: undefined }))
      } else if (field === 'nickname') {
        resetNicknameStatus()
        setErrors(prev => ({ ...prev, nickname: undefined }))
      }

      // Clear form errors when user makes changes
      setErrors(prev => ({ ...prev, form: undefined }))
    },
    [resetEmailStatus, resetNicknameStatus]
  )

  const validateForm = React.useCallback(async (): Promise<boolean> => {
    const newErrors: FormErrors = {}

    if (!formData.username) {
      newErrors.form = '이름을 입력하세요.'
    }

    if (!formData.email) {
      newErrors.email = '이메일을 입력하세요.'
    } else {
      const emailValid = await checkEmail(formData.email)
      if (!emailValid) return false
    }

    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력하세요.'
    } else {
      const nicknameValid = await checkNickname(formData.nickname)
      if (!nicknameValid) return false
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }

    return true
  }, [formData, checkEmail, checkNickname])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      if (!providerId) {
        throw new Error('providerId가 없습니다.')
      }

      const isValid = await validateForm()
      if (!isValid) return

      const result = await registerAction({
        providerId,
        email: formData.email,
        username: formData.username,
        nickname: formData.nickname,
      })

      if (!result.success) {
        const errorCode = result.error || 'register_failed'

        if (errorCode === 'email_taken') {
          setErrors({ email: '이미 사용 중인 이메일입니다.' })
        } else if (errorCode === 'nickname_taken') {
          setErrors({ nickname: '이미 사용 중인 닉네임입니다.' })
        } else {
          setErrors({ form: result.error || '회원가입에 실패했습니다. 다시 시도해주세요.' })
        }
        return
      }

      // 회원가입 완료 후 Credentials Provider로 즉시 로그인
      const signInResult = await signIn('register-complete', {
        userId: result.data?.userId,
        callbackUrl: '/',
        redirect: true,
      })

      if (signInResult?.error) {
        setErrors({ form: '로그인 처리에 실패했습니다. 다시 시도해주세요.' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ form: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' })
    } finally {
      setLoading(false)
    }
  }

  const isSubmitDisabled =
    loading ||
    !formData.email ||
    !formData.nickname ||
    !formData.username ||
    emailStatus !== 'available' ||
    nicknameStatus !== 'available'

  return (
    <main className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h1 className={styles['label-title']}>회원가입</h1>

        <label className={styles.label}>
          <span className={styles['label-title']}>이메일(필수)</span>
          <div className={styles['input-row']}>
            <input
              className={styles.input}
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              onBlur={() => checkEmail(formData.email)}
              placeholder={MESSAGES.LABEL.EMAIL_PLACEHOLDER}
              required
              aria-describedby="email-error email-success"
              aria-invalid={!!errors.email}
            />
            <button
              type="button"
              onClick={() => checkEmail(formData.email)}
              disabled={!formData.email || emailStatus === 'checking'}
              className={styles['check-button']}
              aria-label={MESSAGES.LABEL.EMAIL_DUPLICATE_CHECK}
            >
              {emailStatus === 'checking'
                ? MESSAGES.LABEL.CHECKING
                : MESSAGES.LABEL.DUPLICATE_CHECK}
            </button>
          </div>
          {emailStatus === 'available' && !errors.email && (
            <span id="email-success" className={styles['success-text']}>
              {MESSAGES.SUCCESS.EMAIL_AVAILABLE}
            </span>
          )}
          {errors.email && (
            <span id="email-error" className={styles['error-text']} role="alert">
              {errors.email}
            </span>
          )}
        </label>

        <label className={styles.label}>
          <span className={styles['label-title']}>닉네임(필수)</span>
          <div className={styles['input-row']}>
            <input
              className={styles.input}
              value={formData.nickname}
              onChange={e => handleInputChange('nickname', e.target.value)}
              onBlur={() => checkNickname(formData.nickname)}
              placeholder={MESSAGES.LABEL.NICKNAME_PLACEHOLDER}
              required
              aria-describedby="nickname-error nickname-success"
              aria-invalid={!!errors.nickname}
            />
            <button
              type="button"
              onClick={() => checkNickname(formData.nickname)}
              disabled={!formData.nickname || nicknameStatus === 'checking'}
              className={styles['check-button']}
              aria-label={MESSAGES.LABEL.NICKNAME_DUPLICATE_CHECK}
            >
              {nicknameStatus === 'checking'
                ? MESSAGES.LABEL.CHECKING
                : MESSAGES.LABEL.DUPLICATE_CHECK}
            </button>
          </div>
          {nicknameStatus === 'available' && !errors.nickname && (
            <span id="nickname-success" className={styles['success-text']}>
              {MESSAGES.SUCCESS.NICKNAME_AVAILABLE}
            </span>
          )}
          {errors.nickname && (
            <span id="nickname-error" className={styles['error-text']} role="alert">
              {errors.nickname}
            </span>
          )}
        </label>

        <label className={styles.label}>
          <span className={styles['label-title']}>이름(필수)</span>
          <div className={styles['input-row']}>
            <input
              className={styles.input}
              value={formData.username}
              onChange={e => handleInputChange('username', e.target.value)}
              placeholder={MESSAGES.LABEL.NAME_PLACEHOLDER}
              required
              aria-label={MESSAGES.LABEL.NAME_INPUT_ARIA}
            />
          </div>
        </label>

        {errors.form && (
          <div className={styles['error-text']} role="alert">
            {errors.form}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={styles['submit-button']}
          aria-describedby="submit-help"
        >
          {loading ? MESSAGES.LABEL.SIGNING_UP : MESSAGES.LABEL.SIGN_UP}
        </button>

        {isSubmitDisabled && !loading && (
          <span id="submit-help" className={styles['note-text']}>
            모든 필드를 입력하고 중복 확인을 완료해주세요.
          </span>
        )}
      </form>
    </main>
  )
}
