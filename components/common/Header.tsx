'use client'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import styles from './Header.module.css'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Sidebar from './Sidebar'
import { IconButton } from '@/components/ui'
import { decodeAndCapitalize, isUUID, isNumericId } from '@/lib/utils'

interface HeaderProps {
  title?: string
}

export default function Header({ title = '' }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // pathname에서 제목을 추출하려면 프롭스가 제공되지 않은 경우에 사용됩니다.
  const getTitleFromPathname = (path: string): string => {
    if (!path || path === '/') return ''
    const parts = path.split('/').filter(Boolean)
    const last = parts[parts.length - 1] || ''

    // UUID 또는 숫자 ID인 경우, 부모 세그먼트 사용
    if ((isUUID(last) || isNumericId(last)) && parts.length > 1) {
      return decodeAndCapitalize(parts[parts.length - 2])
    }

    return decodeAndCapitalize(last)
  }

  const displayTitle = title || getTitleFromPathname(pathname)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          {isHome ? (
            <>
              {/* Left: Hamburger */}
              <div className={styles['left-group']}>
                <IconButton type="button" aria-label="메뉴 열기" onClick={handleMenuToggle}>
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
                </IconButton>
              </div>
              {/* Center: empty on home */}
              <div className={styles.center} />
              {/* Right: Alarm + Profile */}
              <div className={styles['right-group']}>
                <IconButton type="button" aria-label="알림">
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
                </IconButton>
                <IconButton
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
                </IconButton>
              </div>
            </>
          ) : (
            <>
              {/* Left: Back button */}
              <div className={styles['left-group']}>
                <IconButton type="button" aria-label="뒤로가기" onClick={() => router.back()}>
                  <Image
                    src="/svg/header-arrow.svg"
                    alt="뒤로가기"
                    width={24}
                    height={24}
                    priority
                  />
                </IconButton>
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
      <Sidebar open={isMenuOpen} setOpen={setIsMenuOpen} />
    </>
  )
}
