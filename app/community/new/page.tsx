'use client'

import React from 'react'
import Image from 'next/image'
import Submit from '@/components/ui/AccentButton'
import Location from '@/components/ui/Dropdown'

import ImageUpload from '@/app/community/new/_components/ImageUploader'
import Field from '@/app/community/new/_components/Field'
import Tag from '@/app/community/new/_components/TagInput'

import styles from './page.module.css'

export const metadata: Metadata = {
  title: '커뮤니티 생성 | 토끼노트',
}

export default function CommunityCreatePage() {
  return (
    <>
      <main>
        <h1 className="sr-only">커뮤니티 생성</h1>

        <form>
          <section>
            <h2 className="sr-only">스터디명</h2>
          </section>
          <section>
            <h2 className="sr-only">스터디지역</h2>
          </section>
          <section>
            <h2 className="sr-only">스터디설명</h2>
          </section>
          <section>
            <h2 className="sr-only">관련태그</h2>
          </section>
          <section>
            <h2 className="sr-only">생성버튼</h2>
          </section>
        </form>
      </main>
    </>
  )
}
