'use client'

import Image from 'next/image'
import styles from './PersonalNotification.module.css'

interface Props {
  name: string
  message: string
  image?: string
  href?: string
}

/**
 * PersonalNotification - 사용자 알람 컴포넌트
 *
 * 사용자 이름, 메시지, 프로필 이미지(옵션), 링크(옵션)를 받아 알림 형태로 표시합니다.
 * 이미지 최적화를 위해 Next.js Image 컴포넌트 사용하며, 기본 아바타를 제공합니다.
 *
 * @component
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.name - 사용자 이름(필수, 이미지 alt에도 사용)
 * @param {string} props.message - 알림 메시지(필수)
 * @param {string} [props.image] - 프로필 이미지 URL(선택)
 * @param {string} [props.href] - 알림 링크 URL(선택)
 * @returns {JSX.Element} 알림 UI 섹션
 *
 * @example
 * <PersonalNotification
 *   name=" "
 *   message="새로운 댓글이 있습니다."
 *   image="/profile.png"
 *   href="/notifications/123"
 * />
 *
 * - 이미지가 없으면 '/default-avatar.png'를 사용합니다.
 * - 알림 제목은 스크린리더 접근성을 위해 sr-only 처리합니다.
 * - name, message는 각각 표시됩니다.
 * - href가 있으면 링크로 감싸집니다.
 */

export default function PersonalNotification({ name, message, image, href }: Props) {
  return (
    <section>
      <h3 className="sr-only">알람</h3>
      <ul className={styles.list}>
        <li>
          <article className="container">
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
