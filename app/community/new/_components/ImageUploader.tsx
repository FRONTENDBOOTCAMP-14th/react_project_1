'use client'

import { IconButton } from '@/components/ui'
import { Camera, X } from 'lucide-react'
import DefaultImg from '@/app/community/new/_components/assets/default-study01.png'
import styles from './ImageUploader.module.css'
import { toast } from 'sonner'
import Image from 'next/image'
import { useState, useRef } from 'react'

interface ImageUploaderProps {
  onImageChange?: (file: File | null) => void
}

/**
 * 이미지 업로드 컴포넌트
 *
 * - 사용자가 이미지를 선택하고 업로드하는 컴포넌트입니다.
 * - 썸네일 클릭 시 이미지를 삭제하고, 업로드 버튼으로 이미지를 선택합니다.
 * @param {Object} props - 컴포넌트 props
 * @param {(file: File | null) => void} [onImageChange] - 이미지 선택 시 호출되는 콜백 함수
 * @returns 선택한 이미지 업로드 컴포넌트
 *
 * @example
 * <ImageUploader onImageChange={(url) => console.log(url)} />
 */
export default function ImageUploader({ onImageChange }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleThumbnailClick = () => {
    // 이미지 삭제
    toast('썸네일 클릭 - 삭제')
  }

  const handleUploadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP, GIF만 가능)')
      return
    }

    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('파일 크기가 너무 큽니다. (최대 5MB)')
      return
    }

    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // 서버에 업로드
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || '이미지 업로드에 실패했습니다.')
      }

      setUploadedUrl(result.data.url)
      onImageChange?.(result.data.url)
      toast.success('이미지가 업로드되었습니다.')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.')
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setIsUploading(false)
    }
  }

  const displayImage = previewUrl || uploadedUrl || DefaultImg.src

  return (
    <section className={styles.wrapper}>
      <h2 className="sr-only">스터디 대표이미지 업로드</h2>

      {/* 이미지 썸네일 영역 */}
      <div className={styles.imageContainer} onClick={handleThumbnailClick}>
        <Image
          src={displayImage}
          alt="스터디 대표 이미지"
          className={styles.image}
          width={150}
          height={150}
        />

        {/* 업로드 버튼 */}
        <div className={styles.button}>
          {previewUrl || uploadedUrl ? (
            <IconButton onClick={handleThumbnailClick} disabled={isUploading}>
              <X size={40} stroke="white" strokeWidth={2} />
            </IconButton>
          ) : (
            <IconButton onClick={handleUploadClick} disabled={isUploading}>
              <Camera size={40} stroke="white" strokeWidth={2} />
            </IconButton>
          )}
        </div>

        {isUploading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
            }}
          >
            업로드 중...
          </div>
        )}
      </div>

      {/* 파일 입력 (숨김) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </section>
  )
}
