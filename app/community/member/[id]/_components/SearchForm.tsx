'use client'

import { IconButton } from '@/components/ui'
import { Search } from 'lucide-react'
import { UI_CONSTANTS } from '@/constants'
import styles from './SearchForm.module.css'

export default function SearchForm(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { type, placeholder, ...rest } = props
  return (
    <form action="" className={styles.form}>
      <input type="text" placeholder={placeholder} {...rest} className={styles.input} />
      <IconButton>
        <Search
          size={UI_CONSTANTS.ICON_SIZE.MEDIUM}
          aria-hidden="true"
          stroke="var(--third-color)"
        />
      </IconButton>
    </form>
  )
}
