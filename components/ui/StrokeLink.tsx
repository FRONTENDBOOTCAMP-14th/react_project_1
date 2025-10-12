import { cn } from '@/lib/utils'
import type { LinkProps } from 'next/link'
import Link from 'next/link'
import type { AnchorHTMLAttributes } from 'react'
import styles from './StrokeLink.module.css'

/**
 * FillLink 컴포넌트에 전달되는 props 타입
 *
 * Next.js LinkProps와 a 태그 속성(href 제외)을 결합합니다.
 */
interface FillLinkProps extends LinkProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {}

/**
 * 스트로크크 링크 컴포넌트
 *
 * - Next.js Link를 사용하여 클라이언트 라우팅을 제공합니다.
 * - 전달된 className에 컴포넌트 기본 스타일을 합칩니다.
 *
 * @param props - 링크 속성 및 a 태그 속성
 * @returns 스타일이 적용된 Link 컴포넌트
 *
 * @example
 * <StrokeLink href="/">홈으로</StrokeLink>
 */
const StrokeLink = (props: FillLinkProps) => {
  return (
    <Link {...props} className={cn(props.className, styles['stroke-link'])}>
      {props.children}
    </Link>
  )
}

export default StrokeLink
