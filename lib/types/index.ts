import type { Session } from 'next-auth'
import type { LinkProps } from 'next/link'
import type { AnchorHTMLAttributes } from 'react'

export interface CustomLinkProps
  extends LinkProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {}

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

export interface CustomSession extends Session {
  userId?: string
}

export * from './common'
export * from './goal'
export * from './community'
export * from './round'
export * from './notification'
export * from './loading'
export * from './member'
export * from './attendance'
export * from './middleware'
export * from './search'
