import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import styles from './Button.module.css'

interface ButtonProps {
  href?: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

// TODO: 프로덕션에서 사용되지 않을 것 -> 삭제 예정
export default function Button({ href, children, variant = 'primary' }: ButtonProps) {
  const className = cn(styles.button, variant === 'secondary' && styles.secondary)

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    )
  }

  return <button className={className}>{children}</button>
}
