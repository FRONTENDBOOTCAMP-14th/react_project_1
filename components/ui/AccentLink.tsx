import type { CustomLinkProps } from '@/lib/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import styles from './AccentLink.module.css'

/**
 * 액센트 링크 컴포넌트
 *
 * - Next.js Link를 사용하여 클라이언트 라우팅을 제공합니다.
 * - 전달된 className에 컴포넌트 기본 스타일을 합칩니다.
 *
 * @param props - 링크 속성 및 a 태그 속성
 * @returns 스타일이 적용된 Link 컴포넌트
 *
 * @example
 * <AccentLink href="/">홈으로</AccentLink>
 */
const AccentLink = (props: CustomLinkProps) => {
  return (
    <Link {...props} className={cn(props.className, styles['accent-link'])}>
      {props.children}
    </Link>
  )
}

export default AccentLink
