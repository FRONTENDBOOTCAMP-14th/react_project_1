'use client'

import { FillButton, FillLink, ParticipateRate } from '@/components/ui'

export default function Page() {
  return (
    <div>
      <h1>UI Component Test Page</h1>
      <FillButton onClick={() => alert('Button Clicked!')}>Click Me</FillButton>
      <FillLink href="/">Fill Link</FillLink>
      <ParticipateRate name="사용자" value={75} max={100} />
    </div>
  )
}
