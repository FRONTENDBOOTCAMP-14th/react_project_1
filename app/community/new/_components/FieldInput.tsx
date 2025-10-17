'use client'

// import { cn } from '@/lib/utils'
import type { ChangeEvent } from 'react'
import styles from './FieldInput.module.css'
// import { text } from 'stream/consumers'

interface FieldInputProps {
  id: string
  label: string
  icon?: React.ReactNode
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  type?: string
  className?: string
}

/**
 * 새모임 생성시 모임명 입력 컴포넌트
 *
 * - 사용자가 모임명을 입력하는 컴포넌트 입니다
 *
 * @param props - 컴포넌트 props
 * @param props.id - input 요소와 label을 연결하기 위한 고유 ID
 * @param props.label - input에 표시할 라벨 텍스트
 * @param props.icon? - 라벨 왼쪽에 표시할 아이콘 (ReactNode)
 * @param props.value - 현재 선택된 값
 * @param props.onChange - 옵션 선택시 호출되는 함수 (React.ChangeEvent<HTMLInputElement> → void)
 * @param props.placeholder - 선택되지 않았을때의 표시될 텍스트
 * @param props.required - 필수입력값 여부
 * @param props.type - input 요소의 타입 (기본값은 text)
 * @param props.className - 추가 CSS 클래스명
 *
 * @returns JSX.Element - 모임명을 입력할 수 있는 입력 필드
 *
 * @example
 * * ```tsx
 *   return (
 *     <FieldInput
 *       id="study-name"
 *       label="모임명"
 *       icon={<User size={16} />}
 *       value={studyName}
 *       onChange={(e) => setStudyName(e.target.value)}
 *       placeholder="스터디명을 입력하세요"
 *       required
 *       type={type}
 *       className={styles.customInput}
 *
 *     />
 *   )
 * }
 * ```
 *
 */

export default function FieldInput({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  className,
}: FieldInputProps) {
  return (
    <div className={styles.filed}>
      <label htmlFor={id} className={styles.label}>
        {icon}
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={styles.input}
      />
    </div>
  )
}
