import styles from './IconButton.module.css'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const IconButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { className, children, ...rest } = props
  return (
    <button className={cn(styles['icon-button'], className)} {...rest}>
      {children}
    </button>
  )
}

export default IconButton
