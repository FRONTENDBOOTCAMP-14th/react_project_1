'use client'

/**
 * 커서 기반 검색 클라이언트 컴포넌트
 * - Server Actions로 실시간 데이터 페칭
 * - 무한 스크롤 또는 버튼 기반 페이지네이션
 */

import CommunityCard from '@/app/community/_components/CommunityCard'
import { FillButton } from '@/components/ui'
import { useInfiniteCursorPagination } from '@/lib/hooks/useCursorPagination'
import type { CursorSearchCommunityResult } from '@/lib/search/cursorSearchServer'
import { initialSearchCommunities, loadMoreCommunities } from '@/lib/search/cursorSearchServer'
import { useEffect, useState } from 'react'

interface CursorSearchClientProps {
  initialParams: {
    region?: string
    subRegion?: string
    search?: string
    searchTags: string[]
  }
}

export default function CursorSearchClient({ initialParams }: CursorSearchClientProps) {
  const [searchParams, setSearchParams] = useState(initialParams)

  // 초기 데이터 로드
  const [initialResult, setInitialResult] = useState<CursorSearchCommunityResult | null>(null)

  // 커서 페이지네이션 Hook 사용
  const {
    data: communities,
    isLoading,
    isError,
    error,
    hasNextPage,
    loadMore,
    reset,
  } = useInfiniteCursorPagination({
    initialData: initialResult || undefined,
    fetchFunction: async ({ cursor, limit }) => {
      return loadMoreCommunities({
        ...searchParams,
        cursor,
        limit,
      })
    },
    pageSize: 10,
  })

  // 검색 파라미터 변경 시 초기 데이터 재로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const result = await initialSearchCommunities({
          ...searchParams,
          limit: 10,
        })
        setInitialResult(result)
        reset() // Hook 상태 리셋
      } catch (err) {
        console.error('Initial search error:', err)
      }
    }

    loadInitialData()
  }, [searchParams, reset])

  /**
   * 검색 파라미터 업데이트 (임시 구현)
   */
  const handleSearch = (newParams: typeof searchParams) => {
    setSearchParams(newParams)
  }

  /**
   * 더 많은 커뮤니티 로드 (무한 스크롤)
   */
  const handleLoadMore = async () => {
    if (hasNextPage && !isLoading) {
      await loadMore()
    }
  }

  if (isError) {
    return (
      <div className="error-container">
        <p>검색 중 오류가 발생했습니다: {error?.message}</p>
        <FillButton onClick={() => window.location.reload()}>다시 시도</FillButton>
      </div>
    )
  }

  return (
    <div className="search-container">
      {/* 검색 폼 (임시) */}
      <div className="search-form-placeholder">
        <h2>검색 필터</h2>
        <p>검색 파라미터: {JSON.stringify(searchParams)}</p>
        <FillButton onClick={() => handleSearch({ ...searchParams, search: '새 검색' })}>
          검색
        </FillButton>
      </div>

      {/* 검색 결과 */}
      <div className="search-results">
        <div className="results-header">
          <h2>검색 결과 ({communities.length}개)</h2>
        </div>

        <div className="community-grid">
          {communities.map(community => (
            <CommunityCard key={community.clubId} community={community} />
          ))}
        </div>

        {/* 더보기 버튼 */}
        {hasNextPage && (
          <div className="load-more-container">
            <FillButton onClick={handleLoadMore} disabled={isLoading} className="load-more-button">
              {isLoading ? '로딩 중...' : '더보기'}
            </FillButton>
          </div>
        )}

        {/* 결과 없음 */}
        {!isLoading && communities.length === 0 && (
          <div className="no-results">
            <p>검색 결과가 없습니다.</p>
            <p>다른 검색어로 시도해보세요.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .search-container {
          padding: var(--spacing-lg);
          max-width: 1200px;
          margin: 0 auto;
        }

        .search-form-placeholder {
          background: var(--background-secondary);
          padding: var(--spacing-lg);
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-xl);
        }

        .search-results {
          margin-top: var(--spacing-xl);
        }

        .results-header {
          margin-bottom: var(--spacing-lg);
        }

        .community-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .load-more-container {
          text-align: center;
          margin-top: var(--spacing-xl);
        }

        .load-more-button {
          padding: var(--spacing-md) var(--spacing-xl);
          font-size: var(--font-size-md);
        }

        .no-results {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-secondary);
        }

        .error-container {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--error-color);
        }
      `}</style>
    </div>
  )
}
