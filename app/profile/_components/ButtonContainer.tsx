'use client'

import EditButton from './EditButton'
import DeleteAccountButton from './DeleteAccountButton'
import { memo } from 'react'
import styles from './ButtonContainer.module.css'

interface ButtonContainerProps {
  onClickEdit: () => void
}

function ButtonContainer({ onClickEdit }: ButtonContainerProps) {
  return (
    <div className={styles['button-container']}>
      <EditButton onClick={onClickEdit} />
      <DeleteAccountButton />
    </div>
  )
}

export default memo(ButtonContainer)
