'use client'

import styles from '@/app/study/[id]/page.module.css'
import { useParams } from 'next/navigation'

export default function Page() {
  const { id } = useParams()
  return (
    <div className={styles.container}>
      <h1>Study Page {id}</h1>
    </div>
  )
}
