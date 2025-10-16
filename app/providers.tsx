'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster richColors position="bottom-right" />
      {children}
    </SessionProvider>
  )
}
