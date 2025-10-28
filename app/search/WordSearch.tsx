'use client'

import { IconButton, TextInput } from '@/components/ui'
import { Search, X } from 'lucide-react'
import { useMemo } from 'react'
import Style from './WordSearch.module.css'

//동작용 로컬 data 후에 api 연결
const MOCK_KEYWORDS = [
  '러닝',
  '러닝메이트',
  '한강',
  '동작구',
  '수원',
  '일산',
  '종로',
  '공부',
  '공원 산책',
  '저녁',
  '아침',
]

interface WordSearchProps {
  query: string
  onChangeQuery: (query: string) => void
  searchTags?: string[]
  onChangeSearchTags?: (tags: string[]) => void
  onSearch?: () => void
  loading?: boolean
  canTagSearch?: boolean
}

export default function WordSearch({
  query,
  onChangeQuery,
  searchTags,
  onChangeSearchTags,
  onSearch,
  loading = false,
  canTagSearch = false,
}: WordSearchProps) {
  const relatedKeywords = useMemo(() => {
    const q = query.trim().toLowerCase()
    // 검색어가 없으면 모든 키워드 표시
    if (!q) return MOCK_KEYWORDS.slice(0, 8)
    // 검색어가 있으면 매칭되는 키워드만 필터링
    return MOCK_KEYWORDS.filter(tag => tag.toLowerCase().includes(q)).slice(0, 8)
  }, [query])

  // 검색 실행
  const handleLocalSearch = () => {
    if (onSearch) {
      onSearch()
    }
  }

  // 연관 검색어 클릭
  const handleAddTag = (tag: string) => {
    if (onChangeSearchTags) {
      const currentTags = searchTags || []
      if (!currentTags.includes(tag)) {
        onChangeSearchTags([...currentTags, tag])
      }
    }
  }

  // 태그 제거
  const handleRemoveTag = (tagToRemove: string) => {
    if (onChangeSearchTags) {
      const currentTags = searchTags || []
      onChangeSearchTags(currentTags.filter(tag => tag !== tagToRemove))
    }
  }

  // 태그 초기화
  const handleClearTags = () => {
    if (onChangeSearchTags) {
      onChangeSearchTags([])
    }
  }

  return (
    <section className={Style.container}>
      <form
        onSubmit={e => {
          e.preventDefault()
          handleLocalSearch()
        }}
      >
        <div className={Style['input-wrapper']}>
          <TextInput
            value={query}
            onChange={e => onChangeQuery(e.currentTarget.value)}
            placeholder="검색어를 입력하세요"
            aria-label="검색어 입력"
          />
          <IconButton
            type="button"
            onClick={handleLocalSearch}
            disabled={loading}
            aria-label="검색 버튼"
          >
            <Search strokeWidth="2.5" size={40} color="var(--third-color)" />
          </IconButton>
        </div>

        {/* 연관 검색 태그 노출 */}
        {canTagSearch && relatedKeywords.length > 0 && (
          <div className={Style['related-keywords']}>
            <ul className={Style.word}>
              {relatedKeywords.map(tag => (
                <li
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleAddTag(tag)
                    }
                  }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 선택된 태그들 */}
        {canTagSearch && searchTags && searchTags.length > 0 && (
          <div className={Style['selected-tags']}>
            <div className={Style['tags-header']}>
              <span className={Style['tags-label']}>검색 태그:</span>
              <button type="button" onClick={handleClearTags} className={Style['clear-tags']}>
                전체 해제
              </button>
            </div>
            <div className={Style['tags-list']}>
              {searchTags.map(tag => (
                <span key={tag} className={Style['tag']}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className={Style['remove-tag']}
                    aria-label={`${tag} 태그 제거`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </form>
    </section>
  )
}
