'use client'

import { Dropdown, IconButton } from '@/components/ui'
import { MESSAGES } from '@/constants'
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
 *   region={region} // 시,도 (선택사항)
 *   subRegion={subRegion} //구 (선택사항)
 *   onChangeRegion={setRegion}
 *   onChangeSubRegion={setSubRegion}
 *   onSearch={handleSearch}
 * />
 * ```
 *
 * @param {SearchRegionProps} props - 컴포넌트 속성
 * @param {string} props.region - 선행되는 선택 지역 이름 (시,도) - 선택사항
 * @param {string} props.subRegion - region 선택에 따라 보여지는 하위 지역선택(구) - 선택사항
 * @param {(v: string) => void} props.onChangeRegion - 상위 지역 선택 시 호출
 * @param {(v: string) => void} props.onChangeSubRegion - 하위 지역 선택 시 호출
 * @param {() => void} props.onSearch - 검색 버튼 클릭 시 호출
 * @param {boolean} props.loading - 검색 중 여부
 *
 * @description
 * - 지역 선택은 선택사항이며, 선택하지 않으면 모든 지역에서 검색합니다.
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
  const [localRegion, setLocalRegion] = useState(region)
  const [localSubRegion, setLocalSubRegion] = useState(subRegion)

  useEffect(() => {
    import('@/lib/json/region.json').then(regionJson => {
      setRegions(regionJson.default as Region[])
    })
  }, [])

  useEffect(() => {
    setLocalRegion(region)
  }, [region])

  useEffect(() => {
    setLocalSubRegion(subRegion)
  }, [subRegion])

  //첫번째 드롭다운 : region(json)
  const regionOptions = useMemo(() => {
    const regionOptions = regions.map((r: Region) => ({ value: r.region, label: r.region }))
    regionOptions.unshift({ value: '', label: '전체' })
    return regionOptions
  }, [regions])

  //두번째 드롭다운: subregion(json)
  const subRegionOptions = useMemo(() => {
    const found = regions.find(r => r.region === localRegion)
    if (!found) return []
    const subRegionOptions = found.subRegion.map((sr: string) => ({ value: sr, label: sr }))
    subRegionOptions.unshift({ value: '', label: '전체' })
    return subRegionOptions
  }, [regions, localRegion])

  return (
    <section className={styles['search-section']}>
      <h2 className="sr-only" id="search-heading">
        {MESSAGES.SEARCH.SEARCH_HEADING}
      </h2>
      <div className={styles['search-controls']}>
        <Dropdown
          options={regionOptions}
          value={localRegion}
          onChange={onChangeRegion}
          placeholder={MESSAGES.SEARCH.REGION_PLACEHOLDER}
        />
        <Dropdown
          options={subRegionOptions}
          value={localSubRegion}
          onChange={onChangeSubRegion}
          placeholder={MESSAGES.SEARCH.SUBREGION_PLACEHOLDER}
        />
        {onSearch && (
          <IconButton
            type="button"
            onClick={onSearch}
            disabled={loading}
            aria-label={MESSAGES.SEARCH.SEARCH_BUTTON_ARIA}
          >
            <Search strokeWidth="1" size={20} color="var(--primary-color)" />
          </IconButton>
        )}
      </div>
    </section>
  )
}
