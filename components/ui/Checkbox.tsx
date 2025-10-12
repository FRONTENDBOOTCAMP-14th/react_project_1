'use client'

import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'
import styles from './Checkbox.module.css'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /** 체크박스 레이블 */
  label?: string
  /** 체크 상태 */
  checked?: boolean
  /** 체크 상태 변경 핸들러 */
  onChange?: (checked: boolean) => void
}

/**
 * 커스텀 체크박스 컴포넌트
 *
 * 기본 체크박스를 숨기고 커스텀 스타일의 체크박스를 표시합니다.
 * 체크 상태에 따라 배경색과 아이콘이 변경됩니다.
 *
 * @param props - 체크박스 속성
 * @param props.label - 체크박스 레이블 텍스트
 * @param props.checked - 체크 여부
 * @param props.onChange - 체크 상태 변경 콜백
 * @param props.className - 추가 클래스명
 *
 * @returns 커스텀 체크박스 컴포넌트
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="할 일"
 *   checked={isChecked}
 *   onChange={setIsChecked}
 * />
 * ```
 */
const Checkbox = ({ label, checked, onChange, className, ...rest }: CheckboxProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked)
  }

  return (
    <label className={cn(styles.checkboxWrapper, className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className={styles.hiddenCheckbox}
        {...rest}
      />
      <span className={cn(styles.customCheckbox, checked && styles.checked)}>
        {checked && (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.checkIcon}
          >
            <path
              d="M5 13L9 17L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  )
}

export default Checkbox
