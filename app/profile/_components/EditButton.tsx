'use client'

import { StrokeButton } from '@/components/ui'
import { memo } from 'react'

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <StrokeButton
      style={{ height: 44, padding: 'var(--spacing-xs) var(--spacing-sm)' }}
      type="button"
      onClick={onClick}
    >
      편집
    </StrokeButton>
  )
}
export default memo(EditButton)
