'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import styles from './Dropdown.module.css'

/**
 * 드롭다운 옵션의 타입 정의
 */
export interface DropdownOption {
  value: string
  label: string
}

/**
 * 드롭다운 컴포넌트의 props 타입 정의
 */
interface DropdownProps {
  options: DropdownOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * 드롭다운 컴포넌트
 *
 * 사용자가 여러 옵션 중 하나를 선택할 수 있는 드롭다운 UI 컴포넌트입니다.
 * 클릭 시 옵션 목록이 나타나며, 배경 클릭으로 닫을 수 있습니다.
 *
 * @param props - 드롭다운 컴포넌트 props
 * @param props.options - 선택 가능한 옵션 목록
 * @param props.value - 현재 선택된 값
 * @param props.onChange - 옵션 선택 시 호출되는 콜백 함수
 * @param props.placeholder - 선택되지 않았을 때 표시할 플레이스홀더 텍스트
 * @param props.className - 추가 CSS 클래스명
 *
 * @returns 드롭다운 컴포넌트
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: 'option1', label: '옵션 1' },
 *   { value: 'option2', label: '옵션 2' }
 * ];
 *
 * <Dropdown
 *   options={options}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 *   placeholder="선택하세요"
 * />
 * ```
 */
export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  className,
}: DropdownProps) {
  // 드롭다운 열림/닫힘 상태 관리
  const [isOpen, setIsOpen] = useState(false)

  // 현재 선택된 옵션 객체 찾기
  const selectedOption = options.find(option => option.value === value)

  /**
   * 옵션 선택 핸들러
   * 선택된 옵션의 값을 onChange 콜백으로 전달하고 드롭다운을 닫습니다.
   *
   * @param optionValue - 선택된 옵션의 값
   */
  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={cn(styles.dropdown, className)}>
      {/* 드롭다운 트리거 버튼 */}
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={styles.label}>{selectedOption?.label || placeholder}</span>
        <svg
          className={cn(styles.icon, isOpen && styles.iconOpen)}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          {/* 드롭다운 옵션 목록 */}
          <ul className={styles.menu} role="listbox">
            {options.map(option => (
              <li key={option.value}>
                {/* 개별 옵션 버튼 */}
                <button
                  type="button"
                  className={cn(styles.option, value === option.value && styles.optionActive)}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
