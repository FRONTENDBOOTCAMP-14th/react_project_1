'use client'

import type { ReactNode } from 'react'
import styles from './DashboardLayout.module.css'

interface DashboardLayoutProps {
  title: string
  children: ReactNode
  emptyMessage?: string
  isEmpty?: boolean
}

export function DashboardLayout({
  title,
  children,
  emptyMessage = '표시할 항목이 없습니다.',
  isEmpty = false,
}: DashboardLayoutProps) {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
      </header>
      <section className={styles.content}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyMessage}>{emptyMessage}</p>
          </div>
        ) : (
          <ul className={styles.list} role="list">
            {children}
          </ul>
        )}
      </section>
    </main>
  )
}
