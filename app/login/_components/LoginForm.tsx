'use client'

import { MESSAGES } from '@/constants'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import styles from './page.module.css'

export function LoginForm() {
  return (
    <main className={styles.container}>
      <Image
        src="/svg/logo.svg"
        alt={MESSAGES.LABEL.BRAND_LOGO_ALT}
        width={96}
        height={96}
        priority
        style={{ marginBottom: 24 }}
      />
      <h1 className={styles['brand-title']}>{MESSAGES.LABEL.BRAND_NAME}</h1>
      <button
        type="button"
        aria-label={MESSAGES.LABEL.KAKAO_LOGIN_ARIA}
        className={styles['kakao-button']}
        onClick={() => signIn('kakao', { callbackUrl: '/' })}
      >
        <Image
          src="/svg/kakao-symbol.svg"
          alt={MESSAGES.LABEL.KAKAO_SYMBOL_ALT}
          width={24}
          height={24}
          priority
        />
        {MESSAGES.LABEL.KAKAO_LOGIN}
      </button>
    </main>
  )
}
