'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'
import styles from './page.module.css'

export function LoginForm() {
  return (
    <main className={styles.container}>
      <Image
        src="/svg/logo.svg"
        alt="토끼노트 로고"
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
