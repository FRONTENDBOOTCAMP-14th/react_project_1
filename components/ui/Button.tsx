import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import styles from './Button.module.css'

interface ButtonProps {
  href?: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

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
