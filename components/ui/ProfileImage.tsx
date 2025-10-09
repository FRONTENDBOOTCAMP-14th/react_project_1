import type { ImgProps } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import styles from './ProfileImage.module.css'

const ProfileImage = ({ src, alt, size = 'big' }: ImgProps & { size?: 'big' | 'small' }) => {
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
