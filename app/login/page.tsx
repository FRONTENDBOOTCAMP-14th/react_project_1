'use client'

import { useSearchParams } from 'next/navigation'
import { LoginForm, RegisterForm } from './_components'

export default function LoginPage() {
  const search = useSearchParams()
  const step = search.get('step')

  if (step === 'register') {
    return <RegisterForm />
  }

  return <LoginForm />
}
