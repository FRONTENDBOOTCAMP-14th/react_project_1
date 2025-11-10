'use client'

import { IconButton, TextInput } from '@/components/ui'
import { MESSAGES } from '@/constants'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import Style from './WordSearch.module.css'

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
  const [localQuery, setLocalQuery] = useState(query)

  // props의 query가 변경되면 로컬 상태 동기화 (외부에서 변경된 경우)
  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  // 검색 실행
  const handleLocalSearch = () => {
    if (onSearch) {
      onSearch()
    }
  }

  const handleInputChange = (value: string) => {
    setLocalQuery(value)
    onChangeQuery(value)
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
            placeholder={MESSAGES.SEARCH.SEARCH_PLACEHOLDER}
            aria-label={MESSAGES.SEARCH.SEARCH_INPUT_ARIA}
            value={localQuery}
            onChange={e => handleInputChange(e.currentTarget.value)}
          />
          <IconButton
            type="button"
            onClick={handleLocalSearch}
            disabled={loading}
            aria-label={MESSAGES.SEARCH.SEARCH_BUTTON_ARIA}
          >
            <Search strokeWidth="2.5" size={40} color="var(--third-color)" />
          </IconButton>
        </div>
      </form>
    </section>
  )
}
