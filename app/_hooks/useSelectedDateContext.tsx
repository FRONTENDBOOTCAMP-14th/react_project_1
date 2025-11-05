'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface SelectedDateContextType {
  selectedDate: number | null
  setSelectedDate: (date: number | null) => void
}

const SelectedDateContext = createContext<SelectedDateContextType | undefined>(undefined)

interface SelectedDateProviderProps {
  children: ReactNode
}

export function SelectedDateProvider({ children }: SelectedDateProviderProps) {
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate())

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
