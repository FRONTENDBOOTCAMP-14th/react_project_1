'use client'
import { useEffect } from 'react'
import styles from './Sidebar.module.css'
import Image from 'next/image'
import Footer from '@/components/common/Footer'
import { IconLink } from '@/components/ui'
import { Search, Plus, Users, Home, X, LogIn /* , UserPlus */ } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const { status } = useSession()

  // ESC 키로 사이드바 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, setOpen])

  // 사이드바가 열렸을 때 body 스크롤 비활성화
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.open : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Image src="/svg/logo.svg" alt="토끼노트" width={36} height={36} priority />
            <span>토끼노트</span>
          </div>
          <button
            type="button"
            className={styles['close-button']}
            onClick={() => setOpen(false)}
            aria-label="사이드바 닫기"
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <nav className={styles.nav}>
            {status === 'authenticated' ? (
              // 로그인된 사용자 메뉴
              <>
                <IconLink href="/search" className={styles['nav-item']}>
                  <Search size={20} />
                  <span>검색</span>
                </IconLink>

                <IconLink href="/community/new" className={styles['nav-item']}>
                  <Plus size={20} />
                  <span>새 스터디</span>
                </IconLink>

                <IconLink href="/community" className={styles['nav-item']}>
                  <Users size={20} />
                  <span>스터디 목록</span>
                </IconLink>

                <IconLink href="/dashboard" className={styles['nav-item']}>
                  <Home size={20} />
                  <span>내 스터디</span>
                </IconLink>
              </>
            ) : (
              // 로그인되지 않은 사용자 메뉴
              <>
                <IconLink href="/search" className={styles['nav-item']}>
                  <Search size={20} />
                  <span>검색</span>
                </IconLink>

                <IconLink href="/community" className={styles['nav-item']}>
                  <Users size={20} />
                  <span>스터디 목록</span>
                </IconLink>

                <IconLink href="/login" className={styles['nav-item']}>
                  <LogIn size={20} />
                  <span>로그인</span>
                </IconLink>

                {/* <IconLink href="/login?step=register" className={styles['nav-item']}>
                  <UserPlus size={20} />
                  <span>회원가입</span>
                </IconLink> */}
              </>
            )}
          </nav>
        </div>
        <Footer />
      </aside>
    </>
  )
}
