'use client'

import {
  AccentButton,
  AccentLink,
  Checkbox,
  Dropdown,
  FillButton,
  FillLink,
  IconLink,
  ParticipateRate,
  StrokeButton,
  StrokeLink,
} from '@/components/ui'
import { useState } from 'react'
import styles from './page.module.css'
import TextInput from '@/components/ui/TextInput'
import IconButton from '@/components/ui/IconButton'
import Image from 'next/image'

export default function Page() {
  const [city, setCity] = useState('')
  const [person, setPerson] = useState('')
  const [isChecked1, setIsChecked1] = useState(false)
  const [isChecked2, setIsChecked2] = useState(true)

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
      <div style={{ display: 'flex', gap: '16px' }}>
        <IconButton onClick={() => alert('Button Clicked!')}>
          <Image src="/svg/logo.svg" alt="" width={40} height={40} />
        </IconButton>
        <IconLink href="/">
          <Image src="/svg/logo.svg" alt="" width={40} height={40} />
        </IconLink>
        <IconButton onClick={() => alert('Button Clicked!')}>
          <Image src="/svg/logo.svg" alt="" width={120} height={120} />
        </IconButton>
        <IconLink href="/">
          <Image src="/svg/logo.svg" alt="" width={120} height={120} />
        </IconLink>
      </div>
      <ParticipateRate name="사용자" value={75} max={100} />

      <div style={{ display: 'flex', gap: '16px' }}>
        <Checkbox checked={isChecked1} onChange={setIsChecked1} />
        <Checkbox checked={isChecked2} onChange={setIsChecked2} />
      </div>

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

      <TextInput placeholder="이름을 입력하세요" />
    </div>
  )
}
