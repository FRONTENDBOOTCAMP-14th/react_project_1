import styles from './Button.module.css'
import Link from 'next/link'
import { ReactNode } from 'react'

type ButtonProps = {
  href?: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

export default function Button({ href, children, variant = 'primary' }: ButtonProps) {
  const className = [styles.button, variant === 'secondary' && styles.secondary].filter(Boolean).join(' ')

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    )
  }

  return <button className={className}>{children}</button>
}
