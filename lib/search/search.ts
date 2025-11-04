import { API_ENDPOINTS, HTTP_HEADERS } from '@/constants'
import type { Community, CommunityListResponse } from '@/lib/types/community'
import type { CommunitySearchParams, SearchPagination, SearchResultItem } from '@/lib/types/search'
import { tryCatchAsync, type AsyncResult, type Result, ok, err } from '@/lib/errors/result'

/**
 * 검색 에러 타입
 */
export interface SearchError {
  type: 'network' | 'validation' | 'not_found' | 'server' | 'parse_error' | 'unknown'
  message: string
  statusCode?: number
  details?: string
}

/**
 * 커뮤니티 검색 아이템 (레거시 호환)
 * @deprecated SearchResultItem 사용 권장
 */
export type CommunitySearchItem = SearchResultItem

/**
 * 커뮤니티 검색 응답 (레거시 호환)
 * @deprecated SearchResult<SearchResultItem> 사용 권장
 */
export interface CommunitySearchResponse {
  items: SearchResultItem[]
  total: number
  pagination?: SearchPagination
}

/**
 * 커뮤니티 검색 쿼리 파라미터 생성
 */
function buildCommunitySearchQuery(params: CommunitySearchParams): string {
  const searchParams = new URLSearchParams()

  if (params.region?.trim()) searchParams.set('region', params.region.trim())
  if (params.subRegion?.trim()) searchParams.set('subRegion', params.subRegion.trim())
  if (params.search?.trim()) searchParams.set('search', params.search.trim())
  if (params.searchTags?.length) {
    params.searchTags.forEach(tag => {
      searchParams.append('searchTags', tag.trim())
    })
  }
  if (params.page && params.page > 1) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.isPublic !== undefined) searchParams.set('isPublic', String(params.isPublic))

  return searchParams.toString()
}

/**
 * Community 타입을 SearchResultItem으로 변환
 */
function transformCommunityToSearchItem(community: Community): SearchResultItem {
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
function transformCommunityResponse(
  response: CommunityListResponse
): Result<CommunitySearchResponse, SearchError> {
  if (!response.success || !response.data) {
    return err({
      type: 'server',
      message: response.error || '커뮤니티 검색에 실패했습니다.',
    })
  }

  const { data: communities, count, pagination } = response.data

  return ok({
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
  })
}

/**
 * 커뮤니티 검색 API 호출
 * @param params - 검색 파라미터
 * @returns Result<커뮤니티 검색 결과, SearchError>
 */
export async function fetchCommunitySearch(
  params: CommunitySearchParams
): AsyncResult<CommunitySearchResponse, SearchError> {
  return tryCatchAsync(
    async () => {
      const queryString = buildCommunitySearchQuery(params)

      const response = await fetch(`${API_ENDPOINTS.COMMUNITIES.BASE}?${queryString}`, {
        method: 'GET',
        headers: HTTP_HEADERS.CONTENT_TYPE_JSON,
        cache: 'no-store',
        signal: params.signal,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText)
        throw {
          statusCode: response.status,
          details: errorText,
        }
      }

      const communityResponse: CommunityListResponse = await response.json()
      const transformResult = transformCommunityResponse(communityResponse)

      if (transformResult.isErr()) {
        throw transformResult.error
      }

      return transformResult.unwrap()
    },
    (error): SearchError => {
      // SearchError 타입이 이미 있는 경우
      if (typeof error === 'object' && error !== null && 'type' in error) {
        return error as SearchError
      }

      // HTTP 에러
      if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        const err = error as { statusCode: number; details: string }
        return {
          type: err.statusCode === 404 ? 'not_found' : err.statusCode >= 500 ? 'server' : 'network',
          message: '커뮤니티 검색 요청에 실패했습니다',
          statusCode: err.statusCode,
          details: err.details,
        }
      }

      // 알 수 없는 에러
      return {
        type: 'unknown',
        message: '커뮤니티 검색 중 알 수 없는 오류가 발생했습니다',
        details: String(error),
      }
    }
  )
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
}): AsyncResult<CommunitySearchResponse, SearchError> {
  return fetchCommunitySearch({
    region: params.region,
    subRegion: params.subRegion,
    search: params.query,
    signal: params.signal,
  })
}
