'use client'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import styles from './Header.module.css'
import { useSession } from 'next-auth/react'

interface HeaderProps {
  title?: string
}

export default function Header({ title = '' }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { status } = useSession()

  // pathname에서 제목을 추출하려면 프롭스가 제공되지 않은 경우에 사용됩니다.
  const getTitleFromPathname = (path: string): string => {
    if (!path || path === '/') return ''
    const parts = path.split('/').filter(Boolean)
    const last = parts[parts.length - 1] || ''

    // UUID 패턴 확인 (표준 UUID 형식: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidPattern.test(last) && parts.length > 1) {
      const parent = parts[parts.length - 2]
      try {
        const decoded = decodeURIComponent(parent.replace(/-/g, ' '))
        // 기본 Latin 문자의 첫 번째 알파벳을 대문자로 변경합니다.
        return decoded.replace(/^[a-z]/, m => m.toUpperCase())
      } catch {
        return parent
      }
    }

    // 마지막 세그먼트가 숫자일 경우 (거의 ID임), 부모 세그먼트를 대신 사용합니다.
    if (/^\d+$/.test(last) && parts.length > 1) {
      const parent = parts[parts.length - 2]
      try {
        const decoded = decodeURIComponent(parent.replace(/-/g, ' '))
        // 기본 Latin 문자의 첫 번째 알파벳을 대문자로 변경합니다.
        return decoded.replace(/^[a-z]/, m => m.toUpperCase())
      } catch {
        return parent
      }
    }

    try {
      const decoded = decodeURIComponent(last.replace(/-/g, ' '))
      // 기본 Latin 문자의 첫 번째 알파벳을 대문자로 변경합니다.
      return decoded.replace(/^[a-z]/, m => m.toUpperCase())
    } catch {
      return last
    }
  }

  const displayTitle = title || getTitleFromPathname(pathname)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {isHome ? (
          <>
            {/* Left: Hamburger */}
            <div className={styles['left-group']}>
              <button type="button" aria-label="메뉴 열기" className={styles['icon-button']}>
                <Image
                  className={styles['default-icon']}
                  src="/svg/menu-ham.svg"
                  alt="메뉴"
                  width={50}
                  height={50}
                  priority
                />
                <Image
                  className={styles['active-icon']}
                  src="/svg/menu-ham-active.svg"
                  alt="메뉴 활성"
                  width={50}
                  height={50}
                  priority
                />
              </button>
            </div>
            {/* Center: empty on home */}
            <div className={styles.center} />
            {/* Right: Alarm + Profile */}
            <div className={styles['right-group']}>
              <button type="button" aria-label="알림" className={styles['icon-button']}>
                <Image
                  className={styles['default-icon']}
                  src="/svg/alarm.svg"
                  alt="알림"
                  width={50}
                  height={50}
                  priority
                />
                <Image
                  className={styles['active-icon']}
                  src="/svg/alarm-active.svg"
                  alt="알림 활성"
                  width={50}
                  height={50}
                  priority
                />
              </button>
              <button
                type="button"
                aria-label="프로필"
                className={styles['icon-button']}
                onClick={() => {
                  if (status === 'authenticated') router.push('/profile')
                  else router.push('/login')
                }}
              >
                <Image
                  className={styles['default-icon']}
                  src="/svg/profile.svg"
                  alt="프로필"
                  width={50}
                  height={50}
                  priority
                />
                <Image
                  className={styles['active-icon']}
                  src="/svg/profile-active.svg"
                  alt="프로필 활성"
                  width={50}
                  height={50}
                  priority
                />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Left: Back button */}
            <div className={styles['left-group']}>
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={() => router.back()}
                className={styles.back}
              >
                <Image src="/svg/header-arrow.svg" alt="뒤로가기" width={24} height={24} priority />
              </button>
            </div>
            {/* Center: Title */}
            <div className={styles.center}>
              {displayTitle && <h1 className={styles.title}>{displayTitle}</h1>}
            </div>
            {/* Right: empty on inner pages */}
            <div className={styles['right-group']} />
          </>
        )}
      </div>
    </header>
  )
}
