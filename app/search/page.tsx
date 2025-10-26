'use client'

import style from './page.module.css'
import SearchRegion from '@/app/search/SearchRegion'
import WordSearch from '@/app/search/WordSearch'

export default function searchpage() {
  return (
    <main className={style.search}>
      <SearchRegion />
      {/* 연관검색어 */}
      <WordSearch />
    </main>
  )
}
