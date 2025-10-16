'use client'

import { useState } from 'react'
import { User, MapPin, Tag, ClipboardList } from 'lucide-react'

import Dropdown from '@/components/ui/Dropdown'
// import TagInput from '@/app/community/new/_components/TagInput'
//import FillButton from '@/components/ui/FillButton'
import styles from './CommunityCreate.module.css'

export default function CommunityCreate() {
  const [studyName, setStudyName] = useState<string>('')
  const [studyRegion, setStudyRegion] = useState('')
  const options = [
    { value: 'option1', label: '옵션 1' },
    { value: 'option2', label: '옵션 2' },
  ]
  const [studyDescription, setStudyDescription] = useState<string>('')
  const [studyTag, setStudyTags] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    //   const formData = {
    //     studyName,
    //     studyRegion,
    //     studyDescription,
    //     studyTags: studyTags
    //       .split(',')
    //       .map(tag => tag.trim())
    //       .filter(tag => tag),
    //   }

    //   console.log('폼 데이터:', formData)
    //   // API 호출 등 제출 로직
  }
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <section>
        <ul>
          <li className={studyName}>
            <h2 className="sr-only">스터디명</h2>
            <label htmlFor="study-name" className={styles.title}>
              <User size={16} className="--secondary-color" />
              이름
            </label>
            <input
              type="text"
              id="study-name"
              name="studyName"
              value={studyName}
              onChange={e => setStudyName(e.target.value)}
              placeholder="스터디명을 입력하세요"
              required
            />
          </li>

          <li>
            <h2 className="sr-only">스터디지역</h2>
            <label className={styles.title}>
              <MapPin size={16} className={styles.title} />
              지역
            </label>
            <Dropdown
              options={options}
              value={studyRegion}
              onChange={setStudyRegion}
              placeholder="선택하세요"
            />
            <Dropdown
              options={options}
              value={studyRegion}
              onChange={setStudyRegion}
              placeholder="선택하세요"
            />
          </li>

          <li>
            <h2 className="sr-only">스터디설명</h2>
            <label htmlFor="study-description" className={styles.title}>
              <ClipboardList size={16} className="--secondary-color" />
              설명
            </label>
            <textarea
              id="study-description"
              name="studyDescription"
              value={studyDescription}
              onChange={e => setStudyDescription(e.target.value)}
              placeholder="스터디에 대한 설명을 입력하세요"
              rows={5}
            />
          </li>

          <li>
            <h2 className="sr-only">관련태그</h2>
            <label htmlFor="study-tag" className={styles.title}>
              <Tag size={16} className="--secondary-color" />
              태그
            </label>
            <input
              type="text"
              id="study-tag"
              name="studyTag"
              value={studyTag}
              onChange={e => setStudyTags(e.target.value)}
              placeholder=",(쉼표)로 태그를 구분해주세요"
              required
            />
          </li>
        </ul>
      </section>

      <section>
        <h2 className="sr-only">생성버튼</h2>
        {/* <FillButton/ type='button' > */}
      </section>
    </form>
  )
}
