import Image from 'next/image'
import styles from './page.module.css'

interface Props {
  name: string
  message: string
  image: string
}

export default function NotificationItem({ name, message, image }: Props) {
  return (
    <div className={styles.card} role="listitem">
      <Image src={image} alt={name} width={45} height={45} className={styles.avatar} />
      <div className={styles.text}>
        <span className={styles.name}>{name}</span>
        <span>{message}</span>
      </div>
    </div>
  )
}
