import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps {
  href?: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

export default function Button({ href, children, variant = 'primary' }: ButtonProps) {
  const className = [styles.button, variant === 'secondary' && styles.secondary]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    )
  }

  return <button className={className}>{children}</button>
}
