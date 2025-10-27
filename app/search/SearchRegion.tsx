'use client'

import { Dropdown, IconButton } from '@/components/ui'
import type { Region } from '@/lib/types'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import styles from './SearchRegion.module.css'

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
 *   onSearch={handleSearch}
 * />
 * ```
 *
 * @param {SearchRegionProps} props - 컴포넌트 속성
 * @param {string} props.region - 선행되는 선택 지역 이름 (시,도)
 * @param {string} props.subRegion - region 선택에 따라 보여지는 하위 지역선택(구)
 * @param {(v: string) => void} props.onChangeRegion - 상위 지역 선택 시 호출
 * @param {(v: string) => void} props.onChangeSubRegion - 하위 지역 선택 시 호출
 * @param {() => void} props.onSearch - 검색 버튼 클릭 시 호출
 * @param {boolean} props.loading - 검색 중 여부
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
  onSearch?: () => void
  loading?: boolean
}

export default function SearchRegion({
  region,
  subRegion,
  onChangeRegion,
  onChangeSubRegion,
  onSearch,
  loading = false,
}: SearchRegionProps) {
  const [regions, setRegions] = useState<Region[]>([])

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
    const found = regions.find(r => r.region === region)
    if (!found) return []
    return found.subRegion.map((sr: string) => ({ value: sr, label: sr }))
  }, [regions, region])

  return (
    <section className={styles['search-section']}>
      <h2 className="sr-only" id="search-heading">
        검색
      </h2>
      <div className={styles['search-controls']}>
        <Dropdown
          options={regionOptions}
          value={region}
          onChange={onChangeRegion}
          placeholder="지역을 선택하세요"
        />
        <Dropdown
          options={subRegionOptions}
          value={subRegion}
          onChange={onChangeSubRegion}
          placeholder="세부 지역을 선택하세요"
        />
        {onSearch && (
          <IconButton
            type="button"
            onClick={onSearch}
            disabled={loading || !region}
            aria-label="검색 버튼"
          >
            <Search strokeWidth="1" size={20} color="var(--primary-color)" />
          </IconButton>
        )}
      </div>
    </section>
  )
}
