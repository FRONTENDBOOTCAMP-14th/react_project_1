'use client'

import React from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import styles from './page.module.css'

export default function LoginPage() {
  const search = useSearchParams()
  const step = search.get('step')

  if (step === 'register') {
    return <RegisterForm />
  }

  return (
    <main className={styles.container}>
      <Image
        src="/svg/logo.svg"
        alt="로고"
        width={96}
        height={96}
        priority
        style={{ marginBottom: 24 }}
      />
      <h1 className={styles['brand-title']}>토끼노트</h1>
      <button
        type="button"
        aria-label="카카오톡으로 시작하기"
        className={styles['kakao-button']}
        onClick={() => signIn('kakao', { callbackUrl: '/' })}
      >
        <Image src="/svg/kakao-symbol.svg" alt="카카오 심볼" width={24} height={24} priority />
        카카오톡으로 시작하기
      </button>
    </main>
  )
}

function RegisterForm() {
  const search = useSearchParams()
  const _provider = search.get('provider') || 'kakao'
  const providerId = search.get('providerId') || ''
  const emailFromQuery = search.get('email') || ''
  const [email, setEmail] = React.useState(emailFromQuery)
  const [username, setUsername] = React.useState('')
  const [nickname, setNickname] = React.useState('')
  const [errors, setErrors] = React.useState<{ email?: string; nickname?: string; form?: string }>(
    {}
  )
  const [loading, setLoading] = React.useState(false)
  const [emailStatus, setEmailStatus] = React.useState<'idle' | 'checking' | 'available' | 'taken'>(
    emailFromQuery ? 'idle' : 'idle'
  )
  const [nicknameStatus, setNicknameStatus] = React.useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle')

  const checkEmail = async (): Promise<boolean> => {
    setErrors(e => ({ ...e, email: undefined }))
    if (!email) {
      setEmailStatus('idle')
      return false
    }
    setEmailStatus('checking')
    try {
      const res = await fetch(`/api/login-kakao/check-email?email=${encodeURIComponent(email)}`)
      const json = await res.json()
      if (json?.taken) {
        setEmailStatus('taken')
        setErrors(e => ({ ...e, email: '이미 사용 중인 이메일입니다.' }))
        return false
      }
      setEmailStatus('available')
      return true
    } catch {
      setEmailStatus('idle')
      return false
    }
  }

  const checkNickname = async (): Promise<boolean> => {
    setErrors(e => ({ ...e, nickname: undefined }))
    if (!nickname) {
      setNicknameStatus('idle')
      return false
    }
    setNicknameStatus('checking')
    try {
      const res = await fetch(
        `/api/login-kakao/check-nickname?nickname=${encodeURIComponent(nickname)}`
      )
      const json = await res.json()
      if (json?.taken) {
        setNicknameStatus('taken')
        setErrors(e => ({ ...e, nickname: '이미 사용 중인 닉네임입니다.' }))
        return false
      }
      setNicknameStatus('available')
      return true
    } catch {
      setNicknameStatus('idle')
      return false
    }
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async ev => {
    ev.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      if (!providerId) throw new Error('providerId 가 없습니다.')
      if (!username) {
        setErrors({ form: '이름을 입력하세요.' })
        return
      }
      if (!email) {
        setErrors({ email: '이메일을 입력하세요.' })
        return
      }
      {
        const ok = await checkEmail()
        if (!ok) return
      }
      if (!nickname) {
        setErrors({ nickname: '닉네임을 입력하세요.' })
        return
      }
      {
        const ok = await checkNickname()
        if (!ok) return
      }
      const res = await fetch('/api/login-kakao/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, email, username, nickname }),
      })
      const json = await res.json()
      if (!res.ok || !json?.ok) {
        const code = json?.error || 'register_failed'
        if (code === 'email_taken') setErrors({ email: '이미 사용 중인 이메일입니다.' })
        else if (code === 'nickname_taken') setErrors({ nickname: '이미 사용 중인 닉네임입니다.' })
        else setErrors({ form: '회원가입에 실패했습니다. 다시 시도해주세요.' })
        return
      }

      // 회원가입 완료 후 Credentials Provider로 즉시 로그인
      const result = await signIn('register-complete', {
        userId: json.userId,
        callbackUrl: '/',
        redirect: true,
      })

      if (result?.error) {
        setErrors({ form: '로그인 처리에 실패했습니다. 다시 시도해주세요.' })
      }
    } catch (_e) {
      setErrors({ form: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.container}>
      <form onSubmit={onSubmit} className={styles.form}>
        <h1 className={styles['label-title']}>회원가입</h1>

        <label className={styles.label}>
          <span className={styles['label-title']}>이메일(필수)</span>
          <div className={styles['input-row']}>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                setEmailStatus('idle')
              }}
              onBlur={checkEmail}
              placeholder="email@example.com"
              required
            />
            <button
              type="button"
              onClick={checkEmail}
              disabled={!email || emailStatus === 'checking'}
              className={styles['check-button']}
            >
              {emailStatus === 'checking' ? '확인중…' : '중복확인'}
            </button>
          </div>
          {emailStatus === 'available' && !errors.email && (
            <span className={styles['success-text']}>사용 가능한 이메일입니다.</span>
          )}
          {errors.email && <span className={styles['error-text']}>{errors.email}</span>}
        </label>

        <label className={styles.label}>
          <span className={styles['label-title']}>닉네임(필수)</span>
          <div className={styles['input-row']}>
            <input
              className={styles.input}
              value={nickname}
              onChange={e => {
                setNickname(e.target.value)
                setNicknameStatus('idle')
              }}
              onBlur={checkNickname}
              placeholder="닉네임을 입력하세요"
              required
            />
            <button
              type="button"
              onClick={checkNickname}
              disabled={!nickname || nicknameStatus === 'checking'}
              className={styles['check-button']}
            >
              {nicknameStatus === 'checking' ? '확인중…' : '중복확인'}
            </button>
          </div>
          {nicknameStatus === 'available' && !errors.nickname && (
            <span className={styles['success-text']}>사용 가능한 닉네임입니다.</span>
          )}
          {errors.nickname && <span className={styles['error-text']}>{errors.nickname}</span>}
        </label>

        <label className={styles.label}>
          <span className={styles['label-title']}>이름(필수)</span>
          <div className={styles['input-row']}>
            <input
              className={styles.input}
              value={username}
              onChange={e => {
                setUsername(e.target.value)
              }}
              placeholder="이름"
              required
            />
          </div>
        </label>

        {errors.form && <div className={styles['error-text']}>{errors.form}</div>}

        <button
          type="submit"
          disabled={
            loading ||
            !email ||
            !nickname ||
            !username ||
            emailStatus !== 'available' ||
            nicknameStatus !== 'available'
          }
          className={styles['submit-button']}
        >
          {loading ? '가입 중...' : '가입하기'}
        </button>
      </form>
    </main>
  )
}
