'use client'

import CommunitySearchResults from './CommunitySearchResults'
import SearchRegion from './SearchRegion'
import WordSearch from './WordSearch'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import type { SearchCommunityResult } from '@/lib/search/searchServer'
import style from './page.module.css'

interface SearchClientProps {
  initialResults: SearchCommunityResult
  initialParams: {
    region: string
    subRegion: string
    search: string
    searchTags: string[]
    page: number
  }
}

export default function SearchClient({ initialResults, initialParams }: SearchClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  /**
   * URL 파라미터 업데이트 함수
   * - 페이지 변경 시를 제외하고는 page를 1로 리셋
   */
  const updateSearchParams = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(searchParams)

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
          params.delete(key)
        } else if (Array.isArray(value)) {
          params.delete(key)
          value.forEach(v => params.append(key, v))
        } else {
          params.set(key, value)
        }
      })

      startTransition(() => {
        router.push(`/search?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  // 지역 변경 핸들러
  const handleRegionChange = useCallback(
    (region: string) => {
      updateSearchParams({ region, page: undefined })
    },
    [updateSearchParams]
  )

  // 세부 지역 변경 핸들러
  const handleSubRegionChange = useCallback(
    (subRegion: string) => {
      updateSearchParams({ subRegion, page: undefined })
    },
    [updateSearchParams]
  )

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback(
    (search: string) => {
      updateSearchParams({ search, page: undefined })
    },
    [updateSearchParams]
  )

  // 태그 변경 핸들러
  const handleTagsChange = useCallback(
    (searchTags: string[]) => {
      updateSearchParams({ searchTags, page: undefined })
    },
    [updateSearchParams]
  )

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page: number) => {
      updateSearchParams({ page: page.toString() })
    },
    [updateSearchParams]
  )

  // Community를 CommunitySearchItem으로 변환
  const searchItems = initialResults.communities.map(community => ({
    id: community.clubId,
    title: community.name,
    region: community.region || null,
    subRegion: community.subRegion || null,
    tags: community.tagname || [],
    description: community.description,
    isPublic: community.isPublic,
    createdAt: new Date(community.createdAt),
  }))

  return (
    <main className={style.search}>
      <SearchRegion
        region={initialParams.region}
        subRegion={initialParams.subRegion}
        onChangeRegion={handleRegionChange}
        onChangeSubRegion={handleSubRegionChange}
        onSearch={() => {}} // URL 기반이므로 빈 함수
        loading={isPending}
      />

      <WordSearch
        query={initialParams.search}
        searchTags={initialParams.searchTags}
        onChangeQuery={handleSearchChange}
        onChangeSearchTags={handleTagsChange}
        onSearch={() => {}} // URL 기반이므로 빈 함수
        loading={isPending}
      />

      <CommunitySearchResults
        items={searchItems}
        loading={isPending}
        pagination={initialResults.pagination}
        onPageChange={handlePageChange}
      />
    </main>
  )
}
