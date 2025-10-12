import type { LinkProps } from 'next/link'
import type { AnchorHTMLAttributes } from 'react'

export interface CustomLinkProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {}
