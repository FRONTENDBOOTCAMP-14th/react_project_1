import type { ImgProps } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import styles from './ProfileImage.module.css'

/**
 * 프로필 이미지 컴포넌트
 *
 * @param props - 이미지 props
 * @param [props.size='small'] - 이미지 크기 ('big'|'small')
 * @returns 프로필 이미지 컴포넌트
 */
const ProfileImage = ({ src, alt, size = 'small' }: ImgProps & { size?: 'big' | 'small' }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={size === 'big' ? 120 : 90}
      height={size === 'big' ? 120 : 90}
      className={styles['profile-image']}
    />
  )
}

export default ProfileImage
