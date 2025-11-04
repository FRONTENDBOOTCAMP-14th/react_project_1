'use client'

import { useCommunity } from '@/lib/hooks'
import { MESSAGES } from '@/constants'
import type { CreateCommunityInput } from '@/lib/types/community'
import ImageUploader from '@/app/community/new/_components/ImageUploader'
import CommunityCreate from '@/app/community/new/_components/CommunityCreate'
import styles from './page.module.css'
import { useState } from 'react'

export default function NewCommunity() {
  const { createCommunity } = useCommunity('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleCreateCommunity = async (data: CreateCommunityInput) => {
    // 이미지 URL을 커뮤니티 데이터에 추가
    const communityData = {
      ...data,
      ...(imageUrl && { imageUrl }),
    }
    return await createCommunity(communityData)
  }

  return (
    <main className={styles.container}>
      <h1 className="sr-only">{MESSAGES.LABEL.NEW_COMMUNITY_CREATE}</h1>
      {/* 1. 이미지 업로드 UI */}
      <section>
        <ImageUploader onImageChange={setImageUrl} />
      </section>
      <section>
        <div> </div>
      </section>
      {/* 2. 커뮤니티 생성 텍스트 데이터 UI (폼 + URL 제출) */}
      <section>
        <CommunityCreate onSubmit={handleCreateCommunity} />
      </section>
    </main>
  )
}
