'use client'

import type { ProgressHTMLAttributes } from 'react'

export interface ParticipateRateProps<T> extends ProgressHTMLAttributes<T> {
  name?: string
}

const ParticipateRate = ({ name, value, max }: ParticipateRateProps<HTMLProgressElement>) => {
  return (
    <div>
      {name && <span>{name}</span>}
      <progress value={value} max={max}>
        {value}%
      </progress>
    </div>
  )
}

export default ParticipateRate
