"use client"

import React from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const search = useSearchParams()
  const step = search.get('step')

  const handleKakaoStart = async () => {
    // TODO: 여기에 카카오 OAuth 시작 로직을 연결하세요.
    // 예: router.push('/api/auth/kakao') 또는 SDK 호출
    await signIn('kakao', { callbackUrl: '/' })
  }

  if (step === 'register') {
    return <RegisterForm />
  }

  return (
    <main
      style={{
        minHeight: 'calc(100dvh - 56px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <a
        href="/api/auth/signin/kakao?callbackUrl=/"
        aria-label="카카오톡으로 시작하기"
        style={{
          width: '100%',
          maxWidth: 360,
          height: 48,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          background: '#FEE500',
          color: '#191600',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          textDecoration: 'none',
        }}
      >
        <Image src="/svg/_kakaoSimbol.svg" alt="카카오 심볼" width={24} height={24} priority />
        카카오톡으로 시작하기
      </a>
    </main>
  )
}

function RegisterForm() {
  const search = useSearchParams()
  const provider = search.get('provider') || 'kakao'
  const providerId = search.get('providerId') || ''
  const emailFromQuery = search.get('email') || ''
  const [email, setEmail] = React.useState(emailFromQuery)
  const [username, setUsername] = React.useState(providerId ? `kakao_${providerId}` : '')
  const [nickname, setNickname] = React.useState('')
  const [errors, setErrors] = React.useState<{ email?: string; nickname?: string; form?: string }>({})
  const [loading, setLoading] = React.useState(false)

  const checkEmail = async () => {
    setErrors((e) => ({ ...e, email: undefined }))
    if (!email) return
    const res = await fetch(`/api/login-kakao/check-email?email=${encodeURIComponent(email)}`)
    const json = await res.json()
    if (json?.taken) setErrors((e) => ({ ...e, email: '이미 사용 중인 이메일입니다.' }))
  }

  const checkNickname = async () => {
    setErrors((e) => ({ ...e, nickname: undefined }))
    if (!nickname) return
    const res = await fetch(`/api/login-kakao/check-nickname?nickname=${encodeURIComponent(nickname)}`)
    const json = await res.json()
    if (json?.taken) setErrors((e) => ({ ...e, nickname: '이미 사용 중인 닉네임입니다.' }))
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      if (!providerId) throw new Error('providerId 가 없습니다.')
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
      await signIn('kakao', { callbackUrl: '/' })
    } catch (_e) {
      setErrors({ form: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: 'calc(100dvh - 56px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 420, display: 'grid', gap: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>회원가입</h1>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, color: '#374151' }}>이메일(선택)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={checkEmail}
            placeholder="email@example.com"
            style={{ height: 40, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px' }}
          />
          {errors.email && <span style={{ color: '#dc2626', fontSize: 12 }}>{errors.email}</span>}
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, color: '#374151' }}>닉네임(필수)</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onBlur={checkNickname}
            placeholder="닉네임을 입력하세요"
            required
            style={{ height: 40, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px' }}
          />
          {errors.nickname && <span style={{ color: '#dc2626', fontSize: 12 }}>{errors.nickname}</span>}
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, color: '#374151' }}>아이디(선택)</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디(중복 허용)"
            style={{ height: 40, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px' }}
          />
        </label>

        {errors.form && <div style={{ color: '#dc2626', fontSize: 12 }}>{errors.form}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            height: 44,
            borderRadius: 8,
            background: '#111827',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading ? '가입 중...' : '가입하기'}
        </button>
      </form>
    </main>
  )
}
