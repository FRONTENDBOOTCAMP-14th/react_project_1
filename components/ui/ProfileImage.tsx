import Image from 'next/image'
import styles from './ProfileImage.module.css'
import type { ImageSize } from '@/lib/types'

interface ProfileImageProps {
  src: string
  alt: string
  size?: ImageSize
}

/**
 * 프로필 이미지 컴포넌트
 *
 * @param props - 이미지 props
 * @param props.src - 이미지 소스 URL
 * @param props.alt - 이미지 대체 텍스트
 * @param [props.size=90] - 이미지 크기 (12 | 20 | 40 | 60 | 90 | 120)
 * @returns 프로필 이미지 컴포넌트
 */
const ProfileImage = ({ src, alt, size = 90 }: ProfileImageProps) => {
  return (
    <Image src={src} alt={alt} width={size} height={size} className={styles['profile-image']} />
  )
}

export default ProfileImage
