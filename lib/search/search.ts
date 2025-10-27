//api 호출 담당 서버 통신 함수
// 검색어 ( q )와 지역(region)을 받아서 결과를 반환
export interface SearchParams {
  region: string
  subRegion?: string
  q?: string
  signal?: AbortSignal
}

export interface SearchItem {
  id: string
  title: string
  region: string
  subRegion?: string
  tags: string[]
}

export interface SearchResponse {
  items: SearchItem[]
  total: number
}

/** 검색 파라미터 직렬화 */
function buildQuery(params: SearchParams) {
  const sp = new URLSearchParams()
  sp.set('region', params.region)
  if (params.subRegion) sp.set('subRegion', params.subRegion)
  if (params.q?.trim()) sp.set('q', params.q.trim())
  return sp.toString()
}

/**
 * fetchSearch: region, subRegion, q 를 GET 파라미터로 전달
 * - AbortSignal 지원
 * - no-store 캐시
 */
export async function fetchSearch(params: SearchParams): Promise<SearchResponse> {
  const qs = buildQuery(params)
  const res = await fetch(`/api/search?${qs}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    signal: params.signal,
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(msg || '검색 요청 실패')
  }

  return res.json()
}
