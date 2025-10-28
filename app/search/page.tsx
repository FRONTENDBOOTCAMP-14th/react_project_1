'use client'

import CommunitySearchResults from '@/app/search/CommunitySearchResults'
import SearchRegion from '@/app/search/SearchRegion'
import WordSearch from '@/app/search/WordSearch'
import { useUrlSearchCommunity } from '@/lib/hooks/useUrlSearchCommunity'
import { fetchCommunitySearch, type CommunitySearchResponse } from '@/lib/search/search'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import style from './page.module.css'

export default function SearchPage() {
  const {
    region,
    subRegion,
    search,
    searchTags,
    page,
    setRegion,
    setSubRegion,
    setSearch,
    setSearchTags,
    setPage,
  } = useUrlSearchCommunity()

  // 검색 결과 상태
  const [searchResults, setSearchResults] = useState<CommunitySearchResponse | null>(null)
  const [loading, setLoading] = useState(false)

  // 검색 실행
  const executeSearch = useCallback(async () => {
    setLoading(true)

    try {
      const params = {
        region: region.trim() || undefined,
        subRegion: subRegion.trim() || undefined,
        search: search.trim() || undefined,
        searchTags: searchTags?.length ? searchTags : undefined,
        page,
        limit: 12,
      }

      const results = await fetchCommunitySearch(params)
      setSearchResults(results)
    } catch (error) {
      console.error('검색 실패:', error)
      toast.error('검색 중 오류가 발생했습니다')
      setSearchResults(null)
    } finally {
      setLoading(false)
    }
  }, [region, subRegion, search, searchTags, page])

  // URL 상태 변경 시 자동 검색
  useEffect(() => {
    // 검색어나 지역이나 태그가 있거나, 페이지가 변경될 때 검색 실행
    if (search.trim() || region.trim() || (searchTags && searchTags.length > 0)) {
      executeSearch()
    } else if (!search.trim() && !region.trim() && (!searchTags || searchTags.length === 0)) {
      // 검색 조건이 모두 없으면 결과 초기화
      setSearchResults(null)
    }
  }, [region, subRegion, search, searchTags, page, executeSearch])

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
    },
    [setPage]
  )

  return (
    <main className={style.search}>
      {/* 지역 선택 */}
      <SearchRegion
        region={region}
        subRegion={subRegion}
        onChangeRegion={setRegion}
        onChangeSubRegion={setSubRegion}
        onSearch={() => executeSearch()}
        loading={loading}
      />

      {/* 검색어 입력 */}
      {/* TODO: 태그 검색 기능 완성 */}
      <WordSearch
        query={search}
        onChangeQuery={setSearch}
        searchTags={searchTags || []}
        onChangeSearchTags={setSearchTags}
        onSearch={() => executeSearch()}
        loading={loading}
      />

      {/* 검색 결과 */}
      <CommunitySearchResults
        items={searchResults?.items || []}
        loading={loading}
        pagination={searchResults?.pagination}
        onPageChange={handlePageChange}
      />
    </main>
  )
}
