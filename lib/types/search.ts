/**
 * 검색 관련 타입 정의
 */

/**
 * 검색 파라미터 - 서버/클라이언트 공통
 */
export interface SearchParams {
  region?: string
  subRegion?: string
  search?: string
  searchTags?: string[]
  page?: number
  limit?: number
}

/**
 * 커뮤니티 검색 파라미터 (클라이언트 API 호출용)
 */
export interface CommunitySearchParams extends SearchParams {
  isPublic?: boolean
  signal?: AbortSignal
}

/**
 * 검색 결과 아이템
 */
export interface SearchResultItem {
  id: string
  title: string
  region: string | null
  subRegion: string | null
  tags: string[]
  description?: string | null
  isPublic: boolean
  createdAt: Date
}

/**
 * 검색 결과 페이지네이션
 */
export interface SearchPagination {
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * 검색 결과
 */
export interface SearchResult<T = SearchResultItem> {
  items: T[]
  total: number
  pagination: SearchPagination
}

/**
 * 정렬 옵션
 */
export type SortOrder = 'asc' | 'desc'
export type SortField = 'createdAt' | 'name' | 'memberCount'

export interface SortOptions {
  field: SortField
  order: SortOrder
}

/**
 * 검색 필터 옵션
 */
export interface SearchFilters extends SearchParams {
  isPublic?: boolean
  sortBy?: SortField
  sortOrder?: SortOrder
}
