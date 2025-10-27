'use client'

import { IconButton, TextInput } from '@/components/ui'
import { Search } from 'lucide-react'
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
  onSearch?: () => void
  loading?: boolean
}

export default function WordSearch({
  query,
  onChangeQuery,
  onSearch,
  loading = false,
}: WordSearchProps) {
  const relatedKeywords = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return MOCK_KEYWORDS.filter(tag => tag.toLowerCase().includes(q)).slice(0, 8)
  }, [query])

  // 검색 실행
  const handleLocalSearch = () => {
    if (onSearch) {
      onSearch()
    }
  }

  // 연관 검색어 클릭
  const handleKeywordClick = (keyword: string) => {
    onChangeQuery(keyword)
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

        {/* 입력시 연관 검색 태그 노출 */}
        {query.trim() && (
          <div className={Style['related-keywords']}>
            <ul className={Style.word}>
              {relatedKeywords.map(tag => (
                <li
                  key={tag}
                  onClick={() => handleKeywordClick(tag)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleKeywordClick(tag)
                    }
                  }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </section>
  )
}
