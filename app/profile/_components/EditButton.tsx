'use client'

import { StrokeButton } from '@/components/ui'
import { MESSAGES } from '@/constants'
import { memo } from 'react'
import styles from './button.module.css'

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <StrokeButton className={styles.button} type="button" onClick={onClick}>
      {MESSAGES.LABEL.PROFILE_EDIT}
    </StrokeButton>
  )
}
export default memo(EditButton)
