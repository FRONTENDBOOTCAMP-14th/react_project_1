'use client'

import { useMemo, useState, useEffect } from 'react'
import { Dropdown } from '@/components/ui'
import styles from './SearchRegion.module.css'

/**
 * 검색 엔진 컴포넌트
 *
 */

// json 데이터 정의
interface Region {
  name: string
  subArea: string[]
}

export default function SearchRegion() {
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedSubArea, setSelectedSubArea] = useState('')

  useEffect(() => {
    import('@/lib/json/region.json').then(regionJson => {
      setRegions(regionJson.default as Region[])
    })
  }, [])

  //첫번째 드롭다운 : name(json)
  const regionOptions = useMemo(
    () => regions.map(r => ({ value: r.name, label: r.name })),
    [regions]
  )

  //두번째 드롭다운: subarea(json)
  const subAreaOptions = useMemo(() => {
    const found = regions.find(r => r.name === selectedRegion)
    if (!found) return []
    return found.subArea.map(sa => ({ value: sa, label: sa }))
  }, [regions, selectedRegion])

  return (
    <section className={styles.searchSection}>
      <h2 className="sr-only" id="search-heading">
        검색
      </h2>
      <div className={styles.searchControls}>
        <Dropdown
          options={regionOptions}
          value={selectedRegion}
          onChange={value => {
            setSelectedRegion(value)
            setSelectedSubArea('')
          }}
          placeholder="선택하세요"
          className="regionDropdownA"
        />
        <Dropdown
          options={subAreaOptions}
          value={selectedSubArea}
          onChange={value => setSelectedSubArea(value)}
          placeholder="선택하세요"
          className="regionDropdownB"
        />
      </div>
    </section>
  )
}
