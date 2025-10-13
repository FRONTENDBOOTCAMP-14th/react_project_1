"use client"

import React from 'react'

export default function LoginPage() {
  const handleKakaoStart = () => {
    // TODO: 여기에 카카오 OAuth 시작 로직을 연결하세요.
    // 예: router.push('/api/auth/kakao') 또는 SDK 호출
    console.log('카카오톡으로 시작하기 클릭')
  }

  return (
    <main style={{
      minHeight: 'calc(100dvh - 56px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <button
        type="button"
        onClick={handleKakaoStart}
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
          cursor: 'pointer'
        }}
      >
        카카오톡으로 시작하기
      </button>
    </main>
  )
}
