import { searchCommunities } from '@/lib/search/searchServer'
import SearchClient from './_components/SearchClient'

interface SearchPageProps {
  searchParams: Promise<{
    region?: string
    subRegion?: string
    search?: string
    searchTags?: string | string[]
    page?: string
  }>
}

/**
 * 검색 페이지 (서버 컴포넌트)
 * - URL searchParams로 검색 조건 받아서 서버에서 데이터 페칭
 * - Next.js 자동 캐싱 활용
 * - SEO 최적화 (검색 결과가 서버에서 렌더링)
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams

  // searchTags 배열 변환
  const searchTags = params.searchTags
    ? Array.isArray(params.searchTags)
      ? params.searchTags
      : [params.searchTags]
    : []

  // 페이지 번호 검증
  let page = params.page ? parseInt(params.page, 10) : 1
  if (isNaN(page) || page < 1) {
    page = 1
  }

  // 서버에서 데이터 페칭
  const result = await searchCommunities({
    region: params.region,
    subRegion: params.subRegion,
    search: params.search,
    searchTags,
    page,
    limit: 6,
  })

  // 클라이언트 컴포넌트에 초기 데이터와 파라미터 전달
  return (
    <SearchClient
      initialResults={result}
      initialParams={{
        region: params.region || '',
        subRegion: params.subRegion || '',
        search: params.search || '',
        searchTags,
        page,
      }}
    />
  )
}
