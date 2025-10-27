'use client'

import { IconButton } from '@/components/ui'
import { Search } from 'lucide-react'
import { UI_CONSTANTS } from '@/constants'
import styles from './SearchForm.module.css'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

interface SearchFormProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  clubId: string
}

export default function SearchForm({ clubId, placeholder, ...rest }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (searchValue.trim()) {
      params.set('search', searchValue.trim())
    } else {
      params.delete('search')
    }

    startTransition(() => {
      router.push(`/community/member/${clubId}?${params.toString()}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        disabled={isPending}
        {...rest}
        className={styles.input}
      />
      <IconButton type="submit" disabled={isPending}>
        <Search
          size={UI_CONSTANTS.ICON_SIZE.MEDIUM}
          aria-hidden="true"
          stroke="var(--third-color)"
        />
      </IconButton>
    </form>
  )
}
