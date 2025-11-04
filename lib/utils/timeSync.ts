/**
 * 시간 동기화 유틸리티
 * 클라이언트와 서버 간의 시간 차이를 보정합니다.
 */

import { useCallback, useEffect, useState } from 'react'

interface ServerTimeResponse {
  serverTime: string
  timestamp: number
}

interface TimeSyncResult {
  serverTime: Date
  clientTime: Date
  offset: number // 서버 시간 - 클라이언트 시간 (밀리초)
  isSynced: boolean
}

class TimeSync {
  private static instance: TimeSync
  private offset: number = 0 // 서버와 클라이언트의 시간 차이 (밀리초)
  private lastSync: number = 0
  private syncInterval: number = 5 * 60 * 1000 // 5분마다 동기화
  private isSyncing: boolean = false

  private constructor() {}

  static getInstance(): TimeSync {
    if (!TimeSync.instance) {
      TimeSync.instance = new TimeSync()
    }
    return TimeSync.instance
  }

  /**
   * 서버와 시간 동기화를 수행합니다.
   */
  async syncWithServer(): Promise<TimeSyncResult> {
    if (this.isSyncing) {
      return this.getCurrentSyncStatus()
    }

    this.isSyncing = true

    try {
      const startTime = Date.now()
      const response = await fetch('/api/server-time')
      const endTime = Date.now()

      if (!response.ok) {
        throw new Error('서버 시간 요청 실패')
      }

      const data: ServerTimeResponse = await response.json()
      const roundTripTime = endTime - startTime
      const estimatedServerTime = data.timestamp + roundTripTime / 2
      const clientTime = Date.now()

      this.offset = estimatedServerTime - clientTime
      this.lastSync = clientTime

      const result: TimeSyncResult = {
        serverTime: new Date(estimatedServerTime),
        clientTime: new Date(clientTime),
        offset: this.offset,
        isSynced: true,
      }

      console.log('시간 동기화 완료:', {
        offset: `${this.offset}ms`,
        roundTripTime: `${roundTripTime}ms`,
      })

      return result
    } catch (error) {
      console.error('시간 동기화 실패:', error)
      return {
        serverTime: new Date(),
        clientTime: new Date(),
        offset: 0,
        isSynced: false,
      }
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * 현재 동기화 상태를 반환합니다.
   */
  getCurrentSyncStatus(): TimeSyncResult {
    const clientTime = Date.now()
    return {
      serverTime: new Date(clientTime + this.offset),
      clientTime: new Date(clientTime),
      offset: this.offset,
      isSynced: this.lastSync > 0 && clientTime - this.lastSync < this.syncInterval,
    }
  }

  /**
   * 보정된 서버 시간을 반환합니다.
   */
  getServerTime(): Date {
    return new Date(Date.now() + this.offset)
  }

  /**
   * 보정된 서버 시간을 ISO 문자열로 반환합니다.
   */
  getServerTimeISO(): string {
    return this.getServerTime().toISOString()
  }

  /**
   * 자동 동기화를 시작합니다.
   */
  startAutoSync(): void {
    // 즉시 동기화
    this.syncWithServer()

    // 주기적으로 동기화
    setInterval(() => {
      this.syncWithServer()
    }, this.syncInterval)
  }

  /**
   * 동기화가 필요한지 확인합니다.
   */
  needsSync(): boolean {
    return Date.now() - this.lastSync > this.syncInterval
  }

  /**
   * 주어진 시간을 서버 시간 기준으로 변환합니다.
   */
  toServerTime(date: Date): Date {
    return new Date(date.getTime() + this.offset)
  }

  /**
   * 서버 시간을 클라이언트 시간 기준으로 변환합니다.
   */
  fromServerTime(serverDate: Date): Date {
    return new Date(serverDate.getTime() - this.offset)
  }
}

// 싱글톤 인스턴스 export
export const timeSync = TimeSync.getInstance()

// 편의 함수들
export const syncTime = () => timeSync.syncWithServer()
export const getServerTime = () => timeSync.getServerTime()
export const getServerTimeISO = () => timeSync.getServerTimeISO()
export const needsSync = () => timeSync.needsSync()
export const toServerTime = (date: Date) => timeSync.toServerTime(date)
export const fromServerTime = (serverDate: Date) => timeSync.fromServerTime(serverDate)

/**
 * React Hook for time sync
 */
export function useTimeSync() {
  const [syncStatus, setSyncStatus] = useState<TimeSyncResult | null>(null)
  const [loading, setLoading] = useState(false)

  const sync = useCallback(async () => {
    setLoading(true)
    try {
      const result = await timeSync.syncWithServer()
      setSyncStatus(result)
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // 초기 동기화
    sync()

    // 자동 동기화 시작
    timeSync.startAutoSync()

    // 주기적으로 상태 업데이트
    const interval = setInterval(() => {
      setSyncStatus(timeSync.getCurrentSyncStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [sync])

  return {
    syncStatus,
    loading,
    sync,
    getServerTime: timeSync.getServerTime.bind(timeSync),
    getServerTimeISO: timeSync.getServerTimeISO.bind(timeSync),
    needsSync: timeSync.needsSync.bind(timeSync),
  }
}
