'use client'

import { IconButton } from '@/components/ui'
import { Camera } from 'lucide-react'
import DefaultImg from '@/app/community/new/_components/assets/default-study01.png'
import styles from './ImageUploader.module.css'

/**
 * 이미지 업로드 컴포넌트
 *
 * - 사용자가 이미지를 선택하는 컴포넌트 입니다.
 * - 썸네일 클릭 시 이미지를 삭제하고, 업로드 버튼으로 이미지를 선택합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {(file: File | null) => void} [props.onImageChange] - 이미지 선택 시 호출되는 콜백 함수
 * @returns {JSX.Element} 선택한 이미지 업로드 컴포넌트
 *
 * @example
 * <ImageUploader onImageChange={(file) => console.log(file)} />
 */

interface ImageUploaderProps {
  onImageChange?: (file: File | null) => void
}

export default function ImageUploader({ onImageChange }: ImageUploaderProps) {
  console.log(onImageChange)
  // 기능은 추가중
  const handleThumbnailClick = () => {
    // 이미지 삭제
    console.log('썸네일 클릭 - 삭제')
  }

  const handleUploadClick = () => {
    // 파일 선택
    console.log('업로드 버튼 클릭')
  }

  return (
    <section className={styles.wrapper}>
      <h2 className="sr-only">스터디 대표이미지 업로드</h2>

      {/* 이미지 썸네일 영역 */}
      <div className={styles.imageContainer} onClick={handleThumbnailClick}>
        <img src={DefaultImg.src} alt="스터디 대표 이미지" className={styles.image} />

        {/* 업로드 버튼 */}
        <div className={styles.button}>
          <IconButton onClick={handleUploadClick}>
            <Camera size={40} stroke="white" strokeWidth={2} />
          </IconButton>
        </div>
      </div>

      {/* 파일 입력 (숨김) */}
      <input type="file" accept="image/*" style={{ display: 'none' }} />
    </section>
  )
}
