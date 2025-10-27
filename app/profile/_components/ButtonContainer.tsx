'use client'

import EditButton from './EditButton'
import DeleteAccountButton from './DeleteAccountButton'
import { memo } from 'react'
import { toast } from 'sonner'

function ButtonContainer() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
      <EditButton
        onClick={() => {
          toast('편집버튼 눌러짐')
        }}
      />
      <DeleteAccountButton />
    </div>
  )
}

export default memo(ButtonContainer)
