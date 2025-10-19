'use client'

import { cn } from '@/lib/utils'
import styles from './FieldInput.module.css'

interface FieldInputProps {
  id: string
  label: string
  icon?: React.ReactNode
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  type?: 'text' | 'textarea' | 'email' | 'number' | 'password'
  className?: string
  rows?: number // textarea일 때 표시할 줄 수
}

/**
 * 정보입력 필드 컴포넌트
 *
 * - 사용자가 정보를 입력하는 컴포넌트 입니다
 *
 * - 기본은 input
 * - type="textarea"일 경우 여러 줄 입력 가능
 *
 * @param props - 컴포넌트 props
 * @param props.id - input 요소와 label을 연결하기 위한 고유 ID
 * @param props.label - input에 표시할 라벨 텍스트
 * @param props.icon? - 라벨 왼쪽에 표시할 아이콘 (ReactNode)
 * @param props.value - 현재 선택된 값
 * @param props.onChange - 옵션 선택시 호출되는 함수 (React.ChangeEvent<HTMLInputElement> → void)
 * @param props.placeholder - 선택되지 않았을때의 표시될 텍스트
 * @param props.required - 필수입력값 여부 (기본값은 true | true면 필수입력, false면 선택입력)
 * @param props.type - input 요소의 타입 (기본값은 text)
 * @param props.className - 추가 CSS 클래스명
 * @param props.rows - textarea일 때 표시할 줄 수( 기본값은 5 )
 *
 * @returns JSX.Element - 정보를 입력할 수 있는 필드
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
 *       type={type} // 'text', 'email', 'number', 'password' , 'textarea' 중 하나
 *       className={styles.customInput}
 *       rows={5} // type이 'textarea'일 때만 사용
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
  required = true,
  type = 'text',
  rows = 5,
  className,
}: FieldInputProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {icon}
        {label}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={cn(styles.textarea, className)}
        />
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={cn(styles.input, className)}
        />
      )}
    </div>
  )
}
