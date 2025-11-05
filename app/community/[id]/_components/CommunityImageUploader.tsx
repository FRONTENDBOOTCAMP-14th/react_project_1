'use client'

import DefaultImg from '@/app/community/new/_components/assets/default-study01.png'
import { Camera } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useCommunityContext } from '../_context/CommunityContext'
import styles from './CommunityImageUploader.module.css'

interface CommunityImageUploaderProps {
  currentImageUrl?: string | null
  communityName: string
  onImageUpdate: (imageUrl: string) => Promise<void>
}

/**
 * 커뮤니티 프로필 이미지 업로더
 * - admin만 이미지 변경 가능
 * - 클릭 시 이미지 업로드
 */
export default function CommunityImageUploader({
  currentImageUrl,
  communityName,
  onImageUpdate,
}: CommunityImageUploaderProps) {
  const { isAdmin } = useCommunityContext()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    if (!isAdmin) return
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

      // 커뮤니티 이미지 URL 업데이트
      await onImageUpdate(result.data.url)
      toast.success('커뮤니티 이미지가 변경되었습니다.')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={styles.container}>
      <div
        className={`${styles.imageWrapper} ${isAdmin ? styles.clickable : ''}`}
        onClick={handleImageClick}
        role={isAdmin ? 'button' : undefined}
        tabIndex={isAdmin ? 0 : undefined}
        aria-label={isAdmin ? '커뮤니티 이미지 변경' : undefined}
      >
        <Image
          src={currentImageUrl || DefaultImg.src}
          alt={`${communityName} 커뮤니티 이미지`}
          width={150}
          height={150}
          className={styles.image}
        />

        {isAdmin && (
          <div className={styles.overlay}>
            <Camera size={24} stroke="white" strokeWidth={2} />
          </div>
        )}

        {isUploading && (
          <div className={styles.loading}>
            <span>업로드 중...</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}
    </div>
  )
}
