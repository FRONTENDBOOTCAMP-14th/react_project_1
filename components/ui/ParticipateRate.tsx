import type { ProgressHTMLAttributes } from 'react'

export interface ParticipateRateProps<T> extends ProgressHTMLAttributes<T> {
  name?: number
}

const ParticipateRate = ({ name, value, max }: ParticipateRateProps<HTMLProgressElement>) => {
  return (
    <div>
      {name && <span>{name}</span>}
      <progress value={value} max={max} />
    </div>
  )
}

export default ParticipateRate
