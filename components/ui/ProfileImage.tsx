import Image from 'next/image'
import { memo } from 'react'
import styles from './ProfileImage.module.css'
import type { ImageSize } from '@/lib/types'
import { UI_CONSTANTS } from '@/constants/ui'

export interface ProfileImageProps {
  /** 이미지 소스 URL (선택사항, 기본값: '/images/example.jpg') */
  src?: string
  /** 이미지 대체 텍스트 */
  alt: string
  /** 이미지 크기 (ImageSize 타입 사용 시) */
  size?: ImageSize
  /** UI_CONSTANTS 사용 시 크기 타입 */
  variant?: 'thumbnail' | 'small' | 'large'
  /** 클래스명 */
  className?: string
  /** 이미지 둥근 모양 */
  radius?: 'full-radius' | 'inner-card-radius'
  /** 이미지 우선 로드 여부 */
  priority?: boolean
}

/**
 * 프로필 이미지 컴포넌트
 *
 * @param props - 이미지 props
 * @param props.src - 이미지 소스 URL (기본값: '/images/example.jpg')
 * @param props.alt - 이미지 대체 텍스트
 * @param props.size - 이미지 크기 (12 | 20 | 40 | 60 | 90 | 120)
 * @param props.variant - UI_CONSTANTS 기반 크기 ('thumbnail' | 'small' | 'large')
 * @param props.className - 추가 CSS 클래스
 * @param props.radius - 이미지 둥근 모양 ('full-radius' | 'inner-card-radius')
 * @param props.priority - 우선 로드 여부
 * @returns 프로필 이미지 컴포넌트
 */
const ProfileImage = memo<ProfileImageProps>(
  ({ src = '/images/example.jpg', alt, size, variant, className, radius, priority = false }) => {
    // 크기 결정 로직
    let imageSize: number
    let containerClass = styles['image-container']

    if (variant) {
      switch (variant) {
        case 'thumbnail':
          imageSize = UI_CONSTANTS.IMAGE_SIZE.PROFILE_THUMBNAIL
          containerClass = styles['image-container']
          break
        case 'small':
          imageSize = UI_CONSTANTS.IMAGE_SIZE.PROFILE_SMALL
          containerClass = styles['image-container']
          break
        case 'large':
          imageSize = UI_CONSTANTS.IMAGE_SIZE.PROFILE_LARGE
          containerClass = styles['image-container']
          break
        default:
          imageSize = UI_CONSTANTS.IMAGE_SIZE.PROFILE_THUMBNAIL
      }
    } else if (size) {
      imageSize = size
      containerClass = styles['profile-image']
    } else {
      imageSize = UI_CONSTANTS.IMAGE_SIZE.PROFILE_THUMBNAIL
      containerClass = styles['image-container']
    }

    // variant 사용 시에는 wrapper div 사용, size 사용 시에는 직접 Image 사용
    if (variant) {
      return (
        <div className={containerClass}>
          <Image
            src={src}
            alt={alt}
            width={imageSize}
            height={imageSize}
            className={styles.image}
            style={{ borderRadius: `var(--${radius})` }}
            sizes={`${imageSize}px`}
            priority={priority}
          />
        </div>
      )
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={imageSize}
        height={imageSize}
        className={`${styles['profile-image']} ${className || ''}`}
        style={{ borderRadius: `var(--${radius})` }}
        priority={priority}
      />
    )
  }
)

ProfileImage.displayName = 'ProfileImage'

export default ProfileImage
