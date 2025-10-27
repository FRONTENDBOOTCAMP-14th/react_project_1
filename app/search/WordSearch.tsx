'use client'

import Style from './WordSearch.module.css'
import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { TextInput, IconButton } from '@/components/ui'

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

export default function WordSearch() {
  const [searchQuery, setSearchQuery] = useState('')

  const relatedKeywords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return MOCK_KEYWORDS.filter(tag => tag.toLowerCase().includes(q)).slice(0, 8)
  }, [searchQuery])

  // 검색 실행
  const handleLocalSearch = () => {}
  //   if (!SearchQuery.trim()) {
  //     setSearchQuery([])
  //     return
  //   }
  // }

  return (
    <section className={Style.container}>
      <form
        onSubmit={e => {
          e.preventDefault()
          handleLocalSearch()
        }}
      >
        <div className={Style.inputWrapper}>
          <TextInput
            value={searchQuery}
            onChange={e => setSearchQuery(e.currentTarget.value)}
            placeholder="검색어를 입력하세요"
            aria-label="검색어 입력"
          />
          <IconButton type="button" onClick={handleLocalSearch} aria-label="검색 버튼">
            <Search strokeWidth="3.5" size={40} color="var(--third-color)" />
          </IconButton>
        </div>

        {/* 입력시 연관 검색 태그 노출 */}
        {searchQuery.trim() && (
          <div className={Style.relatedKeywords}>
            <ul className={Style.word}>
              {relatedKeywords.map(tag => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </section>
  )
}
