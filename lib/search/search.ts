import { API_ENDPOINTS, HTTP_HEADERS } from '@/constants'
import type { Community, CommunityListResponse } from '@/lib/types/community'

/**
 * 커뮤니티 검색 파라미터 인터페이스
 */
export interface CommunitySearchParams {
  region?: string
  subRegion?: string
  search?: string
  page?: number
  limit?: number
  isPublic?: boolean
  signal?: AbortSignal
}

/**
 * 커뮤니티 검색 결과 인터페이스 (기존 호환성을 위해)
 */
export interface CommunitySearchItem {
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
 * 커뮤니티 검색 응답 인터페이스 (기존 호환성을 위해)
 */
export interface CommunitySearchResponse {
  items: CommunitySearchItem[]
  total: number
  pagination?: {
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * 커뮤니티 검색 쿼리 파라미터 생성
 */
function buildCommunitySearchQuery(params: CommunitySearchParams): string {
  const searchParams = new URLSearchParams()

  if (params.region?.trim()) searchParams.set('region', params.region.trim())
  if (params.subRegion?.trim()) searchParams.set('subRegion', params.subRegion.trim())
  if (params.search?.trim()) searchParams.set('search', params.search.trim())
  if (params.page && params.page > 1) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.isPublic !== undefined) searchParams.set('isPublic', String(params.isPublic))

  return searchParams.toString()
}

/**
 * Community 타입을 CommunitySearchItem으로 변환
 */
function transformCommunityToSearchItem(community: Community): CommunitySearchItem {
  return {
    id: community.clubId,
    title: community.name,
    region: community.region || null,
    subRegion: community.subRegion || null,
    tags: community.tagname || [],
    description: community.description,
    isPublic: community.isPublic,
    createdAt: new Date(community.createdAt),
  }
}

/**
 * CommunityListResponse를 CommunitySearchResponse로 변환
 */
function transformCommunityResponse(response: CommunityListResponse): CommunitySearchResponse {
  if (!response.success || !response.data) {
    throw new Error(response.error || '커뮤니티 검색에 실패했습니다.')
  }

  const { data: communities, count, pagination } = response.data

  return {
    items: communities.map(transformCommunityToSearchItem),
    total: count,
    pagination: pagination
      ? {
          page: pagination.page,
          limit: pagination.limit,
          totalPages: pagination.totalPages,
          hasNext: pagination.page < pagination.totalPages,
          hasPrev: pagination.page > 1,
        }
      : undefined,
  }
}

/**
 * 커뮤니티 검색 API 호출
 * @param params - 검색 파라미터
 * @returns 커뮤니티 검색 결과
 */
export async function fetchCommunitySearch(
  params: CommunitySearchParams
): Promise<CommunitySearchResponse> {
  const queryString = buildCommunitySearchQuery(params)

  const response = await fetch(`${API_ENDPOINTS.COMMUNITIES.BASE}?${queryString}`, {
    method: 'GET',
    headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
    cache: 'no-store',
    signal: params.signal,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText)
    throw new Error(errorText || '커뮤니티 검색 요청 실패')
  }

  const communityResponse: CommunityListResponse = await response.json()
  return transformCommunityResponse(communityResponse)
}

/**
 * 기존 executeSearch 함수 (하위 호환성을 위해 유지)
 * @deprecated fetchCommunitySearch 사용을 권장
 */
export async function executeSearch(params: {
  region?: string
  subRegion?: string
  query?: string
  signal?: AbortSignal
}): Promise<CommunitySearchResponse> {
  return fetchCommunitySearch({
    region: params.region,
    subRegion: params.subRegion,
    search: params.query,
    signal: params.signal,
  })
}
