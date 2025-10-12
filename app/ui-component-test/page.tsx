'use client'

import {
  AccentButton,
  AccentLink,
  Dropdown,
  FillButton,
  FillLink,
  ParticipateRate,
  StrokeButton,
  StrokeLink,
} from '@/components/ui'
import { useState } from 'react'
import styles from './page.module.css'

export default function Page() {
  const [city, setCity] = useState('')
  const [person, setPerson] = useState('')

  const cityOptions = [
    { value: 'gomin', label: '고민시' },
    { value: 'seoul', label: '서울시' },
    { value: 'busan', label: '부산시' },
    { value: 'incheon', label: '인천시' },
  ]

  const personOptions = [
    { value: 'kanghd', label: '강호동' },
    { value: 'yjs', label: '유재석' },
    { value: 'kjk', label: '김종국' },
  ]

  return (
    <div className={styles['ui-component-test']}>
      <h1>UI Component Test Page</h1>
      <FillButton onClick={() => alert('Button Clicked!')}>로그인</FillButton>
      <StrokeButton onClick={() => alert('Button Clicked!')}>로그인</StrokeButton>
      <AccentButton onClick={() => alert('Button Clicked!')}>로그인</AccentButton>
      <FillLink href="/">Fill Link</FillLink>
      <StrokeLink href="/">Stroke Link</StrokeLink>
      <AccentLink href="/">Accent Link</AccentLink>
      <ParticipateRate name="사용자" value={75} max={100} />

      <Dropdown
        options={cityOptions}
        value={city}
        onChange={setCity}
        placeholder="도시를 선택하세요"
      />
      <Dropdown
        options={personOptions}
        value={person}
        onChange={setPerson}
        placeholder="사람을 선택하세요"
      />
    </div>
  )
}
