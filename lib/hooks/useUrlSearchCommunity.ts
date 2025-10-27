import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

/**
 * 검색 조건을 URL과 동기화하는 커스텀 훅
 */
export function useUrlSearchCommunity() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL에서 초기 상태 읽기
  const getInitialURLCommunity = useCallback(() => {
    return {
      region: searchParams.get('region') || '',
      subRegion: searchParams.get('subRegion') || '',
      search: searchParams.get('search') || '',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '12', 10),
      isPublic: searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined,
    }
  }, [searchParams])

  const [searchState, setSearchState] = useState(getInitialURLCommunity)

  // URL을 업데이트하는 함수
  const updateUrl = useCallback(
    (newState: Partial<typeof searchState>) => {
      const params = new URLSearchParams()

      // 새로운 상태로 업데이트
      const updatedState = { ...searchState, ...newState }
      setSearchState(updatedState)

      // URL 파라미터 설정
      if (updatedState.region.trim()) {
        params.set('region', updatedState.region.trim())
      }
      if (updatedState.subRegion.trim()) {
        params.set('subRegion', updatedState.subRegion.trim())
      }
      if (updatedState.search.trim()) {
        params.set('search', updatedState.search.trim())
      }
      if (updatedState.page > 1) {
        params.set('page', String(updatedState.page))
      }
      if (updatedState.limit !== 12) {
        params.set('limit', String(updatedState.limit))
      }
      if (updatedState.isPublic !== undefined) {
        params.set('isPublic', String(updatedState.isPublic))
      }

      // URL 교체 (히스토리 유지)
      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
      router.replace(newUrl, { scroll: false })
    },
    [searchState, router, pathname]
  )

  // 개별 필드 업데이트 함수들
  const setRegion = useCallback(
    (region: string) => {
      updateUrl({ region, page: 1 }) // 지역 변경 시 페이지를 1로 리셋
    },
    [updateUrl]
  )

  const setSubRegion = useCallback(
    (subRegion: string) => {
      updateUrl({ subRegion, page: 1 }) // 하위 지역 변경 시 페이지를 1로 리셋
    },
    [updateUrl]
  )

  const setSearch = useCallback(
    (search: string) => {
      updateUrl({ search, page: 1 }) // 검색어 변경 시 페이지를 1로 리셋
    },
    [updateUrl]
  )

  const setPage = useCallback(
    (page: number) => {
      updateUrl({ page })
    },
    [updateUrl]
  )

  // URL 변경 감지하여 상태 동기화
  useEffect(() => {
    const newState = getInitialURLCommunity()
    setSearchState(newState)
  }, [getInitialURLCommunity])

  return {
    // 현재 상태
    region: searchState.region,
    subRegion: searchState.subRegion,
    search: searchState.search,
    page: searchState.page,
    limit: searchState.limit,
    isPublic: searchState.isPublic,

    // 상태 변경 함수들
    setRegion,
    setSubRegion,
    setSearch,
    setPage,

    // 전체 상태 변경
    updateSearchState: updateUrl,

    // URL에서 직접 읽어오는 상태 (URL과 완전 동기화된 상태)
    urlState: getInitialURLCommunity(),
  }
}
