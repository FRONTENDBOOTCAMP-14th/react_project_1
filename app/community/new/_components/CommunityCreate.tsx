'use client'

import { ClipboardList, MapPin, Tag, User } from 'lucide-react'
import { useState } from 'react'

import FieldInput from '@/app/community/new/_components/FieldInput'
import Dropdown from '@/components/ui/Dropdown'
import FillButton from '@/components/ui/FillButton'
import regionData from '@/lib/json/region.json'
import type { CreateCommunityInput } from '@/lib/types/community'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import styles from './CommunityCreate.module.css'

interface CommunityCreateProps {
  onSubmit: (
    data: CreateCommunityInput
  ) => Promise<{ success: boolean; data?: { clubId: string }; error?: string }>
}

export default function CommunityCreate({ onSubmit }: CommunityCreateProps) {
  const router = useRouter()
  const [studyName, setStudyName] = useState('')
  const [studyRegion, setStudyRegion] = useState('')
  const [subRegion, setSubRegion] = useState('')
  const [studyDescription, setStudyDescription] = useState('')
  const [studyTag, setStudyTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const options = (() => {
    const uniqueRegions = new Set<string>()
    regionData.forEach(r => {
      if (r?.region) uniqueRegions.add(r.region)
    })
    return Array.from(uniqueRegions)
      .sort((a, b) => a.localeCompare(b))
      .map(region => ({ value: region, label: region }))
  })()

  const subOptions = (() => {
    const target = regionData.find(r => r?.region === studyRegion)
    if (!target?.subRegion?.length) return []
    const uniqueSubs = Array.from(new Set(target.subRegion.filter(Boolean)))
    return uniqueSubs.sort((a, b) => a.localeCompare(b)).map(sub => ({ value: sub, label: sub }))
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studyName.trim()) {
      toast.error('모임명을 입력해주세요')
      return
    }

    setIsSubmitting(true)

    try {
      // 지역 정보 조합 (예: "서울특별시 강남구")
      const region = [studyRegion, subRegion].filter(Boolean).join(' ')

      // 태그 처리 (쉼표로 구분된 문자열을 첫 번째 태그만 사용)
      const tagname =
        studyTag
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag)[0] || undefined

      const result = await onSubmit({
        name: studyName.trim(),
        description: studyDescription.trim() || undefined,
        isPublic: true, // 기본값을 공개로 설정
        region: region || undefined,
        subRegion: subRegion || undefined,
        tagname,
      })

      if (result.success) {
        toast.success('커뮤니티가 성공적으로 생성되었습니다!')
        // 생성된 커뮤니티 페이지로 리디렉션
        router.push(`/community/${result.data?.clubId}`)
      } else {
        toast.error(result.error || '커뮤니티 생성에 실패했습니다')
      }
    } catch (_error) {
      toast.error('커뮤니티 생성 중 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <section>
        <ul className={styles.ul}>
          <li className={styles.li}>
            <h2 className="sr-only">스터디명</h2>
            <FieldInput
              id="study-name"
              label="모임명"
              icon={<User size={20} fill="black" stroke="white" strokeWidth={0} />}
              value={studyName}
              onChange={e => setStudyName(e.target.value)}
              placeholder="스터디명을 입력하세요"
              required={true}
              type="text"
              className={styles.input}
            />
          </li>

          <li className={styles.li}>
            <h2 className="sr-only">스터디지역</h2>
            <label htmlFor="study-region" className={styles.label}>
              <MapPin size={20} fill="black" stroke="white" strokeWidth={2} />
              지역
            </label>
            <div className={styles.region}>
              <Dropdown
                options={options}
                value={studyRegion}
                onChange={setStudyRegion}
                placeholder="광역시/도"
              />
              <Dropdown
                options={subOptions}
                value={subRegion}
                onChange={setSubRegion}
                placeholder="시/구/군"
              />
            </div>
          </li>

          <li className={styles.li}>
            <h2 className="sr-only">스터디설명</h2>
            <FieldInput
              id="study-description"
              label="설명"
              icon={<ClipboardList size={20} fill="black" stroke="white" strokeWidth={1.5} />}
              value={studyDescription}
              onChange={e => setStudyDescription(e.target.value)}
              placeholder="스터디에 대한 설명을 입력하세요"
              type="textarea"
              rows={5}
            />
          </li>

          <li className={styles.li}>
            <h2 className="sr-only">관련태그</h2>
            <FieldInput
              id="study-tag"
              label="태그"
              icon={<Tag size={20} fill="black" stroke="white" strokeWidth={2} />}
              value={studyTag}
              onChange={e => setStudyTags(e.target.value)}
              placeholder=",(쉼표)로 태그를 구분해주세요"
              required={false}
              type="text"
              className={styles.input}
            />
          </li>
        </ul>
      </section>

      <section className={styles.submit}>
        <h2 className="sr-only">생성버튼</h2>
        <FillButton type="submit" formAction="" disabled={isSubmitting}>
          {isSubmitting ? '생성 중...' : '생성'}
        </FillButton>
      </section>
    </form>
  )
}
