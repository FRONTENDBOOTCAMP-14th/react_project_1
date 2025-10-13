'use client'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import styles from './Header.module.css'

type HeaderProps = {
  title?: string
}

export default function Header({ title = '' }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'

  // Derive a display title from pathname if prop is not provided
  const getTitleFromPathname = (path: string): string => {
    if (!path || path === '/') return ''
    const parts = path.split('/').filter(Boolean)
    const last = parts[parts.length - 1] || ''
    try {
      const decoded = decodeURIComponent(last.replace(/-/g, ' '))
      // Capitalize first letter only for basic Latin letters; leave others (e.g., Korean) as-is
      return decoded.replace(/^[a-z]/, (m) => m.toUpperCase())
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
            <div className={styles.leftGroup}>
              <button type="button" aria-label="메뉴 열기" className={styles.iconButton}>
                <Image src="/svg/_menuHam.svg" alt="메뉴" width={50} height={50} priority />
              </button>
            </div>
            {/* Center: empty on home */}
            <div className={styles.center} />
            {/* Right: Alarm + Profile */}
            <div className={styles.rightGroup}>
              <button type="button" aria-label="알림" className={styles.iconButton}>
                <Image src="/svg/_alarm.svg" alt="알림" width={50} height={50} priority />
              </button>
              <button
                type="button"
                aria-label="프로필"
                className={styles.iconButton}
                onClick={() => router.push('/login')}
              >
                <Image src="/svg/_profile.svg" alt="프로필" width={50} height={50} priority />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Left: Back button */}
            <div className={styles.leftGroup}>
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={() => router.back()}
                className={styles.back}
              >
                <Image src="/svg/_headerArrow.svg" alt="뒤로가기" width={24} height={24} priority />
              </button>
            </div>
            {/* Center: Title */}
            <div className={styles.center}>
              {displayTitle && <h1 className={styles.title}>{displayTitle}</h1>}
            </div>
            {/* Right: empty on inner pages */}
            <div className={styles.rightGroup} />
          </>
        )}
      </div>
    </header>
  )
}
