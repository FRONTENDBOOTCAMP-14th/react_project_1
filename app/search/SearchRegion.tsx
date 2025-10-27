'use client'

import { useMemo, useState, useEffect } from 'react'
import { Dropdown } from '@/components/ui'
import styles from './SearchRegion.module.css'
import type { Region } from '@/lib/types'

/**
 * 드롭다운 지역 선택 컴포넌트
 *
 * @component
 * @example
 * ```tsx
 * <SearchRegion
 *   region={region} // 시,도
 *   subRegion={subRegion} //구
 *   onChangeRegion={setRegion}
 *   onChangeSubRegion={setSubRegion}
 * />
 * ```
 *
 * @param {SearchRegionProps} props - 컴포넌트 속성
 * @param {string} props.region - 선행되는 선택 지역 이름 (시,도)
 * @param {string} props.subRegion - region 선택에 따라 보여지는 하위 지역선택(구)
 * @param {(v: string) => void} props.onChangeRegion - 상위 지역 선택 시 호출
 * @param {(v: string) => void} props.onChangeSubRegion - 하위 지역 선택 시 호출
 *
 * @description
 * - 첫번째 드롭다운에서 지역(region.json의 'region')의 목록을 선택후
 *   선택된 지역에 따라 두번째 드롭다운('subRegion')항목이 동적 변경 표시됨
 * - 알아서 import해서 지역 이름을 로드함
 *
 */

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
    () => regions.map((r: Region) => ({ value: r.region, label: r.region })),
    [regions]
  )

  //두번째 드롭다운: subregion(json)
  const subRegionOptions = useMemo(() => {
    const found = regions.find(r => r.region === selectedRegion)
    if (!found) return []
    return found.subRegion.map((sr: string) => ({ value: sr, label: sr }))
  }, [regions, selectedRegion])

  return (
    <section className={styles['search-section']}>
      <h2 className="sr-only" id="search-heading">
        검색
      </h2>
      <div className={styles['search-controls']}>
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
