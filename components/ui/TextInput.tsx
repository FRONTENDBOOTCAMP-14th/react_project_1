'use client'

import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, Ref } from 'react'
import styles from './TextInput.module.css'

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>
  label?: string
}

const TextInput = ({ type = 'text', className, ref, label, ...rest }: TextInputProps) => {
  return (
    <>
      {label && <label htmlFor={label}>{label}</label>}
      <input
        ref={ref}
        type={type}
        id={label}
        className={cn(className, styles['text-input'])}
        {...rest}
      />
    </>
  )
}

export default TextInput
