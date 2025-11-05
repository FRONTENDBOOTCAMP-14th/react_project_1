'use client'

import { AccentButton, FillButton, StrokeButton } from '@/components/ui'
import type { ReactNode } from 'react'
import styles from './SharedForm.module.css'

export interface FormFieldProps {
  label: string
  type?: 'text' | 'textarea' | 'number' | 'datetime-local' | 'select'
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  options?: Array<{ value: string; label: string }>
  disabled?: boolean
  rows?: number
  fieldId?: string
  ariaDescription?: string
}

/**
 * 공용 폼 필드 컴포넌트
 */
export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  options,
  disabled = false,
  rows = 4,
  fieldId,
  ariaDescription,
}: FormFieldProps) {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            aria-describedby={ariaDescription ? `${fieldId}-description` : undefined}
          />
        )
      case 'select':
        return (
          <select
            id={fieldId}
            value={value}
            onChange={e => onChange(e.target.value)}
            required={required}
            disabled={disabled}
            aria-describedby={ariaDescription ? `${fieldId}-description` : undefined}
          >
            <option value="">{placeholder}</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      default:
        return (
          <input
            id={fieldId}
            type={type}
            value={value}
            onChange={e =>
              onChange(
                type === 'number'
                  ? parseInt(e.target.value) || 0
                  : type === 'datetime-local'
                    ? e.target.value
                    : e.target.value
              )
            }
            placeholder={placeholder}
            required={required}
            min={min}
            max={max}
            disabled={disabled}
            aria-describedby={ariaDescription ? `${fieldId}-description` : undefined}
          />
        )
    }
  }

  return (
    <div className={styles['form-field']}>
      <label htmlFor={fieldId}>{label}</label>
      {renderInput()}
      {ariaDescription && fieldId && (
        <span id={`${fieldId}-description`} className="sr-only">
          {ariaDescription}
        </span>
      )}
    </div>
  )
}

export interface SharedFormProps {
  children: ReactNode
  onSubmit: (e: React.FormEvent) => void
  submitText?: string
  cancelText?: string
  onCancel?: () => void
  disabled?: boolean
  variant?: 'default' | 'inline' | 'compact'
  submitButtonType?: 'accent' | 'fill' | 'stroke'
  cancelButtonType?: 'accent' | 'fill' | 'stroke'
  className?: string
}

/**
 * 공용 폼 컴포넌트
 */
export function SharedForm({
  children,
  onSubmit,
  submitText = '저장',
  cancelText = '취소',
  onCancel,
  disabled = false,
  variant = 'default',
  submitButtonType = 'fill',
  cancelButtonType = 'stroke',
  className = '',
}: SharedFormProps) {
  const formClassName = [
    styles['form-container'],
    variant === 'inline' && styles['form-inline'],
    variant === 'compact' && styles['form-compact'],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const renderButton = (
    type: 'accent' | 'fill' | 'stroke',
    props: React.ComponentProps<typeof AccentButton>
  ) => {
    switch (type) {
      case 'accent':
        return <AccentButton {...props} />
      case 'fill':
        return <FillButton {...props} />
      case 'stroke':
        return <StrokeButton {...props} />
      default:
        return <FillButton {...props} />
    }
  }

  return (
    <form onSubmit={onSubmit} className={formClassName}>
      <div className={styles['form-fields']}>{children}</div>
      <div className={styles['form-actions']}>
        {onCancel &&
          renderButton(cancelButtonType, {
            type: 'button',
            onClick: onCancel,
            disabled,
            children: cancelText,
          })}
        {renderButton(submitButtonType, {
          type: 'submit',
          disabled,
          children: submitText,
        })}
      </div>
    </form>
  )
}
