'use client'

import { StrokeButton } from '@/components/ui'
import { memo } from 'react'
import styles from './button.module.css'

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <StrokeButton className={styles.button} type="button" onClick={onClick}>
      편집
    </StrokeButton>
  )
}
export default memo(EditButton)
