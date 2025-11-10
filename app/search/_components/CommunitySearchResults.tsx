'use client'

import { FillButton, IconButton } from '@/components/ui'
import { MESSAGES } from '@/constants'
import type { SearchResultItem } from '@/lib/types'
import { Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import styles from './CommunitySearchResults.module.css'

interface CommunitySearchResultsProps {
  items: SearchResultItem[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  onPageChange?: (page: number) => void
}

export default function CommunitySearchResults({
  items,
  loading = false,
  pagination,
  onPageChange,
}: CommunitySearchResultsProps) {
  if (loading) {
    return (
      <section className={styles.results} aria-label={MESSAGES.SEARCH.SEARCH_RESULTS_ARIA}>
        <div className={styles.loading}>
          <div className={styles['loading-spinner']} />
          <p>커뮤니티를 검색하는 중...</p>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className={styles.results} aria-label={MESSAGES.SEARCH.SEARCH_RESULTS_ARIA}>
        <div className={styles.empty}>
          <p>검색 결과가 없습니다.</p>
          <p>다른 검색어로 시도해보세요.</p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.results} aria-label={MESSAGES.SEARCH.SEARCH_RESULTS_ARIA}>
      <div className={styles['results-header']}>
        <h2>검색 결과</h2>
        <span className={styles['results-count']}>
          총 {pagination?.page || 1}페이지 ({items.length}개)
        </span>
      </div>

      <div className={styles['results-grid']}>
        {items.map(item => (
          <Link key={item.id} href={`/community/${item.id}`} className={styles['community-card']}>
            <div className={styles['card-header']}>
              <h3 className={styles['community-title']}>{item.title}</h3>
              <div className={styles['community-badges']}>
                {item.tags.slice(0, 2).map(tag => (
                  <span key={tag} className={styles['badge-tag']}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {item.description && (
              <p className={styles['community-description']}>
                {item.description.length > 100
                  ? `${item.description.substring(0, 100)}...`
                  : item.description}
              </p>
            )}

            <div className={styles['community-meta']}>
              <div className={styles['meta-item']}>
                <MapPin size={14} />
                <span>{item.region || '지역 미설정'}</span>
                {item.subRegion && <span>{item.subRegion}</span>}
              </div>
              <div className={styles['meta-item']}>
                <Calendar size={14} />
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 페이지네이션 */}
      {pagination && pagination.totalPages > 1 && (
        <nav className={styles.pagination} aria-label={MESSAGES.SEARCH.PAGINATION_ARIA}>
          <div className={styles['pagination-info']}>
            <span>
              {pagination.page} / {pagination.totalPages} 페이지
            </span>
          </div>

          <div className={styles['pagination-controls']}>
            <IconButton
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              aria-label="이전 페이지"
            >
              <ChevronLeft size={16} />
            </IconButton>

            {/* 페이지 번호 버튼들 */}
            <div className={styles['page-numbers']}>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }

                return (
                  <FillButton
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`${styles['page-button']} ${
                      pageNum === pagination.page ? styles['page-button-active'] : ''
                    }`}
                  >
                    {pageNum}
                  </FillButton>
                )
              })}
            </div>

            <IconButton
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNext}
              aria-label={MESSAGES.SEARCH.NEXT_PAGE_ARIA}
            >
              <ChevronRight size={16} />
            </IconButton>
          </div>
        </nav>
      )}
    </section>
  )
}
