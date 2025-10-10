import type { LinkProps } from 'next/link'
import type { AnchorHTMLAttributes } from 'react'
import styles from './FillLink.module.css'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface FillLinkProps extends LinkProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {}

const FillLink = (props: FillLinkProps) => {
  return (
    <Link {...props} className={cn(props.className, styles['fill-link'])}>
      {props.children}
    </Link>
  )
}

export default FillLink
