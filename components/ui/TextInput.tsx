'use client'

import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, Ref } from 'react'
import styles from './TextInput.module.css'

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  ref?: Ref<HTMLInputElement>
  label?: string
}

// TODO: Label 컴포넌트와 함께 사용 고려, error 메시지 표시 기능 추가 고려
const TextInput = ({ type = 'text', className, error, ref, label, ...rest }: TextInputProps) => {
  return (
    <>
      {label && <label htmlFor={label}>{label}</label>}
      <input
        ref={ref}
        type={type}
        id={label}
        className={cn(className, styles['text-input'], error && styles['text-input--error'])}
        aria-invalid={error}
        {...rest}
      />
    </>
  )
}

export default TextInput
