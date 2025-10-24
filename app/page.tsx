import Image from 'next/image'
import styles from './page.module.css'
import { IconLink } from '@/components/ui'
import { HomeContent } from './_components'

export default function HomePage() {
  return (
    <main className={styles.main}>
      <div className={styles['logo-container']}>
        <IconLink className={styles['logo-link']} href="/">
          <Image
            src="/svg/logo.svg"
            alt="Study Club Tracker 로고"
            width={40}
            height={40}
            priority
          />
        </IconLink>
      </div>

      <HomeContent />
    </main>
  )
}
