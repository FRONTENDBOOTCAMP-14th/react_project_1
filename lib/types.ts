import type { LinkProps } from 'next/link'
import type { AnchorHTMLAttributes } from 'react'

export interface CustomLinkProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {}

export type ImageSize = 12 | 20 | 40 | 60 | 90 | 120

/**
 * 페이지네이션 정보
 */
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}
