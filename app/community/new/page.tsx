'use client'

import { useCommunity } from '@/lib/hooks'
import type { CreateCommunityInput } from '@/lib/types/community'
import ImageUploader from '@/app/community/new/_components/ImageUploader'
import CommunityCreate from '@/app/community/new/_components/CommunityCreate'
import styles from './page.module.css'

export default function NewCommunity() {
  const { createCommunity } = useCommunity('')

  const handleCreateCommunity = async (data: CreateCommunityInput) => {
    return await createCommunity(data)
  }

  return (
    <main className={styles.container}>
      <h1 className="sr-only">새 커뮤니티 생성</h1>
      {/* 1. 이미지 업로드 UI */}
      <section>
        <ImageUploader />
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
