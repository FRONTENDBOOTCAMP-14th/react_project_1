'use client'

import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'
import styles from './FillButton.module.css'

/**
 * 채워진 버튼 컴포넌트
 *
 * - 전달된 className에 컴포넌트 기본 스타일을 합칩니다.
 * - onClick 등 기본 button 속성을 그대로 사용할 수 있습니다.
 *
 * @param props 버튼 속성 및 이벤트 핸들러
 * @returns 스타일이 적용된 button 요소
 *
 * @example
 * <FillButton onClick={() => alert('Button Clicked!')}>로그인</FillButton>
 */
const FillButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, className, onClick, ...rest } = props
  return (
    <button className={cn(styles['fill-button'], className)} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}

export default FillButton
