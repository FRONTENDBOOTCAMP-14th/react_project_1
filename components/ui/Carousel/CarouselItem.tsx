import type { ReactNode, HTMLAttributes } from 'react'
import styles from './CarouselItem.module.css'
import { cn } from '@/lib/utils'

export interface CarouselItemProps extends HTMLAttributes<HTMLDivElement> {
  /** 아이템 내용 */
  children: ReactNode
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * CarouselItem 컴포넌트
 * Carousel의 개별 아이템
 */
const CarouselItem = ({ children, className, ...rest }: CarouselItemProps) => {
  return (
    <div
      className={cn(styles.item, className)}
      role="tabpanel"
      aria-roledescription="slide"
      {...rest}
    >
      {children}
    </div>
  )
}

export default CarouselItem
