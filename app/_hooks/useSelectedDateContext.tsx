'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface SelectedDateContextType {
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
}

const SelectedDateContext = createContext<SelectedDateContextType | undefined>(undefined)

interface SelectedDateProviderProps {
  children: ReactNode
}

function getTodayString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function SelectedDateProvider({ children }: SelectedDateProviderProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayString)

  const contextValue = { selectedDate, setSelectedDate }

  return (
    <SelectedDateContext.Provider value={contextValue}>{children}</SelectedDateContext.Provider>
  )
}

export function useSelectedDate(): SelectedDateContextType {
  const context = useContext(SelectedDateContext)
  if (context === undefined) {
    throw new Error('useSelectedDate must be used within a SelectedDateProvider')
  }
  return context
}
