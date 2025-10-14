'use client'

import { useParams } from 'next/navigation'
import StudyProfile from './_components/StudyProfile'

export default function Page() {
  const { id } = useParams()
  return (
    <>
      <StudyProfile id={id as string} />
      <p>StudyProfile {id}</p>
    </>
  )
}
