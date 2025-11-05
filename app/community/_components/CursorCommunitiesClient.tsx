'use client'

/**
 * 커서 기반 커뮤니티 목록 클라이언트
 * - 무한 스크롤 지원
 * - Server Actions로 실시간 데이터 페칭
 */

import { useState, useEffect } from 'react'
import { useInfiniteCursorPagination } from '@/lib/hooks/useCursorPagination'
import {
  fetchInitialCommunities,
  fetchCommunitiesWithCursor,
} from '@/lib/community/cursorCommunityServer'
import type { CursorCommunitiesResult } from '@/lib/community/cursorCommunityServer'
import { FillButton } from '@/components/ui'
import CommunityCard from './CommunityCard'

interface CursorCommunitiesClientProps {
  initialResult?: CursorCommunitiesResult
  initialParams?: {
    isPublic?: boolean
    region?: string
  }
}

export default function CursorCommunitiesClient({
  initialResult,
  initialParams = {},
}: CursorCommunitiesClientProps) {
  const [filters, setFilters] = useState(initialParams)

  // 초기 데이터 설정
  const [currentInitialResult, setCurrentInitialResult] = useState<CursorCommunitiesResult | null>(
    initialResult || null
  )

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
    initialData: currentInitialResult || undefined,
    fetchFunction: async ({ cursor, limit }) => {
      return fetchCommunitiesWithCursor({
        ...filters,
        cursor,
        limit,
      })
    },
    pageSize: 20,
  })

  // 필터 변경 시 초기 데이터 재로드 (서버에서 전달받은 초기 데이터가 없는 경우에만)
  useEffect(() => {
    if (!initialResult) {
      const loadInitialData = async () => {
        try {
          const result = await fetchInitialCommunities({
            ...filters,
            limit: 20,
          })
          setCurrentInitialResult(result)
          reset()
        } catch (err) {
          console.error('Initial communities error:', err)
        }
      }

      loadInitialData()
    }
  }, [filters, reset, initialResult])

  /**
   * 필터 업데이트
   */
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  /**
   * 더 많은 커뮤니티 로드
   */
  const handleLoadMore = async () => {
    if (hasNextPage && !isLoading) {
      await loadMore()
    }
  }

  if (isError) {
    return (
      <div className="error-container">
        <p>커뮤니티 로딩 중 오류가 발생했습니다: {error?.message}</p>
        <FillButton onClick={() => window.location.reload()}>다시 시도</FillButton>
      </div>
    )
  }

  return (
    <div className="communities-container">
      {/* 필터 섹션 */}
      <div className="filters-section">
        <h2>커뮤니티 목록</h2>
        <div className="filter-controls">
          <select
            value={filters.isPublic === undefined ? 'all' : filters.isPublic.toString()}
            onChange={e =>
              handleFilterChange({
                ...filters,
                isPublic: e.target.value === 'all' ? undefined : e.target.value === 'true',
              })
            }
          >
            <option value="all">전체</option>
            <option value="true">공개</option>
            <option value="false">비공개</option>
          </select>

          <select
            value={filters.region || 'all'}
            onChange={e =>
              handleFilterChange({
                ...filters,
                region: e.target.value === 'all' ? undefined : e.target.value,
              })
            }
          >
            <option value="all">전체 지역</option>
            <option value="서울">서울</option>
            <option value="경기">경기</option>
            <option value="부산">부산</option>
            <option value="대구">대구</option>
          </select>
        </div>
      </div>

      {/* 커뮤니티 목록 */}
      <div className="communities-grid">
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
          <p>커뮤니티가 없습니다.</p>
          <p>새로운 커뮤니티를 만들어보세요!</p>
        </div>
      )}

      <style jsx>{`
        .communities-container {
          padding: var(--spacing-lg);
          max-width: 1200px;
          margin: 0 auto;
        }

        .filters-section {
          background: var(--background-secondary);
          padding: var(--spacing-lg);
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-xl);
        }

        .filter-controls {
          display: flex;
          gap: var(--spacing-md);
          margin-top: var(--spacing-md);
        }

        .filter-controls select {
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background: var(--background-primary);
          color: var(--text-primary);
        }

        .communities-grid {
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
