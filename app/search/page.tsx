'use client'

import style from './page.module.css'
import SearchRegion from '@/app/search/SearchRegion'
import WordSearch from '@/app/search/WordSearch'

export default function searchpage() {
  const [region, setRegion] = useState('')
  const [subRegion, setSubRegion] = useState('')
  const [query, setQuery] = useState('')

  const handleSearch = useCallback(() => {
    const hasRegion = !!region
    const hasQuery = !!query.trim()

    // 지역 선택 없이 검색시 토스트 알람
    if (!hasRegion) {
      toast({ title: '지역을 먼저 선택하세요' })
      return
    }
    // 지역만 선택후 검색
    if (hasRegion && !hasQuery) {
      executeSearch({ region, subRegion: subRegion || undefined })
      return
    }

    // 지역선택 + 검색어 검색
    executeSearch({ region, subRegion: subRegion || undefined, query })
  }, [region, subRegion, query])
  return (
    <main className={style.search}>
      {/* 지역 선택 */}
      <SearchRegion />

      {/* 연관검색어 */}
      <WordSearch />
    </main>
  )
}
