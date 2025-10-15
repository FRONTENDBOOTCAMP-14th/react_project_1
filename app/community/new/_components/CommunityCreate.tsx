'use client'

import { useState } from 'react'
import Dropdown from '@/components/ui/Dropdown'
import TagInput from '@/app/community/new/_components/TagInput'
import FillButton from '@/components/ui/FillButton'

const CommunityCreate = () => {
  const [studyName, setStudyName] = useState<string>('')
  const [studyRegion, setStudyRegion] = useState<string>('')
  const [studyDescription, setStudyDescription] = useState<string>('')
  const [studyTags, setStudyTags] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = {
      studyName,
      studyRegion,
      studyDescription,
      studyTags: studyTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag),
    }

    console.log('폼 데이터:', formData)
    // API 호출 등 제출 로직
  }
}

export default function CommunityCreate() {
  return (
    <form onSubmit={handleSubmit}>
      <section>
        <h2 className="sr-only">스터디명</h2>
        <label htmlFor="study-name">스터디명</label>
        <input
          type="text"
          id="study-name"
          name="studyName"
          value={studyName}
          onChange={e => setStudyName(e.target.value)}
          placeholder="스터디명을 입력하세요"
          required
        />

        <h2 className="sr-only">스터디지역</h2>
        <Dropdown>
          value={studyRegion}
          onChange={setStudyRegion}
        </Dropdown>

        <h2 className="sr-only">스터디설명</h2>
        <label htmlFor="study-description">스터디설명</label>
        <textarea
          id="study-description"
          name="studyDescription"
          value={studyDescription}
          onChange={e => setStudyDescription(e.target.value)}
          placeholder="스터디에 대한 설명을 입력하세요"
          rows={5}
        />

        <h2 className="sr-only">관련태그</h2>
        <TagInput value={studyTags} onChange={setStudyTags} />
      </section>

      <section>
        <h2 className="sr-only">생성버튼</h2>
        <FillButton type="submit">생성</FillButton>
      </section>
    </form>
  )
}
