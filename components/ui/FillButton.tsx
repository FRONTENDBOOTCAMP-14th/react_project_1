'use client'

import type { ButtonHTMLAttributes } from 'react'
import styles from './FillButton.module.css'
import { cn } from '@/lib/utils'

const FillButton = ({ children, className, onClick }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button className={cn(className, styles['fill-button'])} onClick={onClick}>
      {children}
    </button>
  )
}

export default FillButton
