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
  const { region, subRegion, search, page, setRegion, setSubRegion, setSearch, setPage } =
    useUrlSearchCommunity()

  // 검색 결과 상태
  const [searchResults, setSearchResults] = useState<CommunitySearchResponse | null>(null)
  const [loading, setLoading] = useState(false)

  // 검색 실행
  const executeSearch = useCallback(async () => {
    if (!region.trim()) {
      toast('지역을 먼저 선택하세요')
      return
    }

    setLoading(true)

    try {
      const params = {
        region: region.trim(),
        subRegion: subRegion.trim() || undefined,
        search: search.trim() || undefined,
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
  }, [region, subRegion, search, page])

  // URL 상태 변경 시 자동 검색
  useEffect(() => {
    if (region.trim()) {
      executeSearch()
    } else {
      setSearchResults(null)
    }
  }, [region, subRegion, search, page, executeSearch])

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
      <WordSearch
        query={search}
        onChangeQuery={setSearch}
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
