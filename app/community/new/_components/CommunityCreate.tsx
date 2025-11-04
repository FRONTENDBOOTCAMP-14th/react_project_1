'use client'

import { ClipboardList, MapPin, Tag, User } from 'lucide-react'
import { useState } from 'react'

import FieldInput from '@/app/community/new/_components/FieldInput'
import Dropdown from '@/components/ui/Dropdown'
import FillButton from '@/components/ui/FillButton'
import { MESSAGES } from '@/constants'
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
      toast.error(MESSAGES.ERROR.COMMUNITY_NAME_REQUIRED)
      return
    }

    setIsSubmitting(true)

    try {
      const tagname =
        studyTag
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag)[0] || undefined

      const result = await onSubmit({
        name: studyName.trim(),
        description: studyDescription.trim() || undefined,
        isPublic: true,
        region: studyRegion || undefined,
        subRegion: subRegion || undefined,
        tagname,
      })

      if (result.success) {
        toast.success(MESSAGES.SUCCESS.COMMUNITY_CREATE)
        router.push(`/community/${result.data?.clubId}`)
      } else {
        toast.error(result.error || MESSAGES.ERROR.COMMUNITY_CREATE_FAILED)
      }
    } catch (_error) {
      toast.error(MESSAGES.ERROR.COMMUNITY_CREATE_ERROR)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <section>
        <ul className={styles.ul}>
          <li className={styles.li}>
            <h2 className="sr-only">{MESSAGES.LABEL.STUDY_NAME}</h2>
            <FieldInput
              id="study-name"
              label={MESSAGES.LABEL.STUDY_NAME}
              icon={<User size={20} fill="black" stroke="white" strokeWidth={0} />}
              value={studyName}
              onChange={e => setStudyName(e.target.value)}
              placeholder={MESSAGES.LABEL.STUDY_NAME_PLACEHOLDER}
              required={true}
              type="text"
              className={styles.input}
            />
          </li>

          <li className={styles.li}>
            <h2 className="sr-only">{MESSAGES.LABEL.STUDY_REGION}</h2>
            <label htmlFor="study-region" className={styles.label}>
              <MapPin size={20} fill="black" stroke="white" strokeWidth={2} />
              {MESSAGES.LABEL.REGION}
            </label>
            <div className={styles.region}>
              <Dropdown
                options={options}
                value={studyRegion}
                onChange={setStudyRegion}
                placeholder={MESSAGES.LABEL.REGION_PLACEHOLDER}
              />
              <Dropdown
                options={subOptions}
                value={subRegion}
                onChange={setSubRegion}
                placeholder={MESSAGES.LABEL.SUB_REGION_PLACEHOLDER}
              />
            </div>
          </li>

          <li className={styles.li}>
            <h2 className="sr-only">{MESSAGES.LABEL.STUDY_DESCRIPTION}</h2>
            <FieldInput
              id="study-description"
              label={MESSAGES.LABEL.DESCRIPTION}
              icon={<ClipboardList size={20} fill="black" stroke="white" strokeWidth={1.5} />}
              value={studyDescription}
              onChange={e => setStudyDescription(e.target.value)}
              placeholder={MESSAGES.LABEL.STUDY_DESCRIPTION_PLACEHOLDER}
              type="textarea"
              rows={5}
            />
          </li>

          <li className={styles.li}>
            <h2 className="sr-only">{MESSAGES.LABEL.STUDY_TAG}</h2>
            <FieldInput
              id="study-tag"
              label={MESSAGES.LABEL.TAG}
              icon={<Tag size={20} fill="black" stroke="white" strokeWidth={2} />}
              value={studyTag}
              onChange={e => setStudyTags(e.target.value)}
              placeholder={MESSAGES.LABEL.TAG_PLACEHOLDER}
              required={false}
              type="text"
              className={styles.input}
            />
          </li>
        </ul>
      </section>

      <section className={styles.submit}>
        <h2 className="sr-only">{MESSAGES.LABEL.CREATE_BUTTON}</h2>
        <FillButton type="submit" formAction="" disabled={isSubmitting}>
          {isSubmitting ? MESSAGES.LOADING.CREATING : MESSAGES.ACTION.CREATE}
        </FillButton>
      </section>
    </form>
  )
}
