'use client'

import { useState } from 'react'
import { Dropdown } from '@/components/ui'
import styles from './SearchRegion.module.css'

/**
 * 검색 엔진 컴포넌트
 *
 */

export default function SearchRegion() {
  const [selectedOption, setSelectedOption] = useState('')
  const options = [
    { value: 'option1', label: '옵션 1' },
    { value: 'option2', label: '옵션 2' },
  ]

  return (
    <section className={styles.searchSection}>
      <h2 className="sr-only" id="search-heading">
        검색
      </h2>
      <div className={styles.searchControls}>
        <Dropdown
          options={options}
          value={selectedOption}
          onChange={value => setSelectedOption(value)}
          placeholder="선택하세요"
        />
        <Dropdown
          options={options}
          value={selectedOption}
          onChange={value => setSelectedOption(value)}
          placeholder="선택하세요"
        />
      </div>
    </section>
  )
}
