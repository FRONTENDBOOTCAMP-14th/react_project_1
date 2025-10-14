'use client'

import { useParams } from 'next/navigation'
import StudyProfile from './_components/StudyProfile'

export default function Page() {
  const { id } = useParams()
  return (
    <>
      <StudyProfile id={id as string} />
      <p>리액트를 연습하는 스터디 입니다.</p>
    </>
  )
}
