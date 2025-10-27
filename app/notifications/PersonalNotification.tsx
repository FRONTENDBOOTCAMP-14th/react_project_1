'use client'

import Image from 'next/image'
import styles from './page.module.css'

interface Props {
  name: string
  message: string
  image?: string
  href?: string
}

export default function NotificationItem({ name, message, image, href }: Props) {
  return (
    <section>
      <h3 className="sr-only">알람</h3>
      <ul className={styles.list}>
        <li>
          <article>
            <a href={href} className={styles.link}>
              <Image
                src={image || '/default-avatar.png'}
                alt={name}
                width={45}
                height={45}
                className={styles.avatar}
              />
              <div className={styles.text}>
                <p className={styles.name}>${name}</p>
                <p className="">${message}</p>
              </div>
            </a>
          </article>
        </li>

        <li>
          <article>
            <a href={href} className={styles.link}>
              <Image
                src={image || '/default-avatar.png'}
                alt={name}
                width={45}
                height={45}
                className={styles.avatar}
              />
              <div className={styles.text}>
                <p className={styles.name}>${name}</p>
                <p className="">${message}</p>
              </div>
            </a>
          </article>
        </li>
      </ul>
    </section>
  )
}
