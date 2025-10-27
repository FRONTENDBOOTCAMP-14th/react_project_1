'use client'

import { useMemo, useState, useEffect } from 'react'
import { Dropdown } from '@/components/ui'
import styles from './SearchRegion.module.css'
import type { Region } from '@/lib/types'

interface SearchRegionProps {
  region: string
  subRegion: string
  onChangeRegion: (v: string) => void
  onChangeSubRegion: (v: string) => void
}

export default function SearchRegion({
  region,
  subRegion,
  onChangeRegion,
  onChangeSubRegion,
}: SearchRegionProps) {
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedSubRegion, setSelectedSubRegion] = useState('')

  useEffect(() => {
    import('@/lib/json/region.json').then(regionJson => {
      setRegions(regionJson.default as Region[])
    })
  }, [])

  //첫번째 드롭다운 : region(json)
  const regionOptions = useMemo(
    () => regions.map(r => ({ value: r.region, label: r.region })),
    [regions]
  )

  //두번째 드롭다운: subregion(json)
  const subRegionOptions = useMemo(() => {
    const found = regions.find(r => r.region === selectedRegion)
    if (!found) return []
    return found.subRegion.map(sr => ({ value: sr, label: sr }))
  }, [regions, selectedRegion])

  return (
    <section className={styles.searchSection}>
      <h2 className="sr-only" id="search-heading">
        검색
      </h2>
      <div className={styles.searchControls}>
        <Dropdown
          options={regionOptions}
          value={region}
          onChange={value => {
            setSelectedRegion(value)
          }}
          placeholder="선택하세요"
        />
        <Dropdown
          options={subRegionOptions}
          value={subRegion}
          onChange={value => setSelectedSubRegion(value)}
          placeholder="선택하세요"
        />
      </div>
    </section>
  )
}
