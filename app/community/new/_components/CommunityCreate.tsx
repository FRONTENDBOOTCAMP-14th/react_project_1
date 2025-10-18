'use client'

import { useState } from 'react'
import { User, MapPin, Tag, ClipboardList } from 'lucide-react' //  루시드 아이콘

import Dropdown from '@/components/ui/Dropdown'
import FillButton from '@/components/ui/FillButton'
import FieldInput from '@/app/community/new/_components/FieldInput'
import styles from './CommunityCreate.module.css'

export default function CommunityCreate() {
  //const [thumbnail, setThumbnail] = useState<File | string | null>(null)
  const [studyName, setStudyName] = useState('')
  const [studyRegion, setStudyRegion] = useState('')
  const options = [
    { value: 'option1', label: '옵션 1' },
    { value: 'option2', label: '옵션 2' },
  ]
  const [studyDescription, setStudyDescription] = useState('')
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
                placeholder="선택하세요"
              />
              <Dropdown
                options={options}
                value={studyRegion}
                onChange={setStudyRegion}
                placeholder="선택하세요"
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
        <FillButton onClick={() => alert('Button Clicked!')}>로그인</FillButton>
      </section>
    </form>
  )
}
