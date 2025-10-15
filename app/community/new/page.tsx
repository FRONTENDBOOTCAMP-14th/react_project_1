import Link from 'next/link'
import ImageUploader from '@/app/community/new/_components/ImageUploader'
import CommunityCreate from '@/app/community/new/_components/CommunityCreate'

import { Children } from 'react'

export default function NewCommunity() {
  return (
    <>
      <main>
        <h1 className="sr-only">새 커뮤니티 생성</h1>

        <ImageUploader>{Children}</ImageUploader>
        <CommunityCreate>{Children}</CommunityCreate>
      </main>
    </>
  )
}
