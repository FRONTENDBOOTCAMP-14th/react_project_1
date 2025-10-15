'use client'

import { useParams } from 'next/navigation'
import StudyProfile from './_components/StudyProfile'
import Link from 'next/link'

export default function Page() {
  const { id } = useParams()
  return (
    <>
      <StudyProfile id={id as string} />
      <p>리액트를 연습하는 스터디 입니다.</p>
      <Link href={`/community/${id}/notification`}>
        <span>공지</span> 노트북 대여는 불가합니다
      </Link>
    </>
  )
}
