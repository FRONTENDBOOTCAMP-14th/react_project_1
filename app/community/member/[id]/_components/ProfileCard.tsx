import Image from 'next/image'
import styles from './ProfileCard.module.css'

export default function ProfileCard({ name }: { name: string }) {
  return (
    <section className={styles.card}>
      <div className={styles.avatarContainer}>
        <Image src="/images/example.jpg" alt="" width={90} height={90} className={styles.avatar} />
      </div>
      <p>{name}</p>
    </section>
  )
}
