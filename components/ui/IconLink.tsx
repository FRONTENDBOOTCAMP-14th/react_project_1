import styles from './IconLink.module.css'
import { cn } from '@/lib/utils'
import type { CustomLinkProps } from '@/lib/types'
import Link from 'next/link'

const IconLink = (props: CustomLinkProps) => {
  const { className, children, ...rest } = props
  return (
    <Link {...rest} className={cn(styles['icon-link'], className)}>
      {children}
    </Link>
  )
}

export default IconLink
