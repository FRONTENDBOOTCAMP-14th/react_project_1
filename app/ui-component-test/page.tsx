'use client'

import { FillButton, FillLink, ParticipateRate } from '@/components/ui'
import styles from './page.module.css'

export default function Page() {
  return (
    <div className={styles['ui-component-test']}>
      <h1>UI Component Test Page</h1>
      <FillButton onClick={() => alert('Button Clicked!')}>로그인</FillButton>
      <FillLink href="/">Fill Link</FillLink>
      <ParticipateRate name="사용자" value={75} max={100} />
    </div>
  )
}
