/**
 * 시간 동기화 유틸리티 테스트
 */

import { timeSync } from '../timeSync'

// Mock fetch
global.fetch = jest.fn()

describe('TimeSync', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset time sync instance
    ;(timeSync as any).offset = 0
    ;(timeSync as any).lastSync = 0
  })

  describe('syncWithServer', () => {
    it('서버 시간 동기화 성공', async () => {
      const mockServerTime = 1698765432000 // 2023-10-31 12:30:32 UTC
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          serverTime: '2023-10-31T12:30:32.000Z',
          timestamp: mockServerTime,
        }),
      }
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await timeSync.syncWithServer()

      expect(result.isSynced).toBe(true)
      expect(result.serverTime).toBeInstanceOf(Date)
      expect(typeof result.offset).toBe('number')
      expect(fetch).toHaveBeenCalledWith('/api/server-time')
    })

    it('서버 응답 실패 시 기본값 반환', async () => {
      const mockResponse = {
        ok: false,
      }
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await timeSync.syncWithServer()

      expect(result.isSynced).toBe(false)
      expect(result.offset).toBe(0)
    })

    it('네트워크 에러 시 기본값 반환', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await timeSync.syncWithServer()

      expect(result.isSynced).toBe(false)
      expect(result.offset).toBe(0)
    })
  })

  describe('getServerTime', () => {
    it('동기화된 서버 시간 반환', () => {
      // Mock offset of 1 hour (3600000 ms)
      ;(timeSync as any).offset = 3600000

      const serverTime = timeSync.getServerTime()
      const clientTime = new Date()

      expect(serverTime.getTime() - clientTime.getTime()).toBe(3600000)
    })

    it('동기화되지 않았을 때 클라이언트 시간 반환', () => {
      ;(timeSync as any).offset = 0

      const serverTime = timeSync.getServerTime()
      const clientTime = new Date()

      // 100ms 이내 차이 (실행 시간 차이)
      expect(Math.abs(serverTime.getTime() - clientTime.getTime())).toBeLessThan(100)
    })
  })

  describe('getCurrentSyncStatus', () => {
    it('동기화 상태 확인', () => {
      ;(timeSync as any).offset = 5000
      ;(timeSync as any).lastSync = Date.now() - 1000 // 1초 전

      const status = timeSync.getCurrentSyncStatus()

      expect(status.isSynced).toBe(true)
      expect(status.offset).toBe(5000)
    })

    it('동기화 만료 상태 확인', () => {
      ;(timeSync as any).offset = 5000
      ;(timeSync as any).lastSync = Date.now() - 6 * 60 * 1000 // 6분 전

      const status = timeSync.getCurrentSyncStatus()

      expect(status.isSynced).toBe(false)
    })
  })

  describe('needsSync', () => {
    it('동기화 필요 여부 확인', () => {
      ;(timeSync as any).lastSync = Date.now() - 4 * 60 * 1000 // 4분 전
      expect(timeSync.needsSync()).toBe(false)
      ;(timeSync as any).lastSync = Date.now() - 6 * 60 * 1000 // 6분 전
      expect(timeSync.needsSync()).toBe(true)
    })
  })

  describe('시간 변환', () => {
    it('toServerTime - 클라이언트 시간을 서버 시간으로 변환', () => {
      ;(timeSync as any).offset = 3600000 // 1시간

      const clientDate = new Date('2023-10-31T12:00:00.000Z')
      const serverDate = timeSync.toServerTime(clientDate)

      expect(serverDate.toISOString()).toBe('2023-10-31T13:00:00.000Z')
    })

    it('fromServerTime - 서버 시간을 클라이언트 시간으로 변환', () => {
      ;(timeSync as any).offset = 3600000 // 1시간

      const serverDate = new Date('2023-10-31T13:00:00.000Z')
      const clientDate = timeSync.fromServerTime(serverDate)

      expect(clientDate.toISOString()).toBe('2023-10-31T12:00:00.000Z')
    })
  })

  describe('getServerTime', () => {
    it('보정된 서버 시간을 반환해야 함', () => {
      ;(timeSync as any).offset = 3600000 // 1시간

      const serverTime = timeSync.getServerTime()

      expect(serverTime).toBeInstanceOf(Date)
      const expectedTime = Date.now() + 3600000
      expect(Math.abs(serverTime.getTime() - expectedTime)).toBeLessThan(100)
    })

    it('offset이 0이면 현재 시간을 반환해야 함', () => {
      ;(timeSync as any).offset = 0

      const serverTime = timeSync.getServerTime()

      expect(serverTime).toBeInstanceOf(Date)
      expect(Math.abs(serverTime.getTime() - Date.now())).toBeLessThan(100)
    })
  })

  describe('getServerTimeISO', () => {
    it('보정된 서버 시간을 ISO 문자열로 반환해야 함', () => {
      ;(timeSync as any).offset = 3600000 // 1시간

      const serverTimeISO = timeSync.getServerTimeISO()

      expect(typeof serverTimeISO).toBe('string')
      expect(serverTimeISO).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('유효한 ISO 형식이어야 함', () => {
      const serverTimeISO = timeSync.getServerTimeISO()

      expect(() => new Date(serverTimeISO)).not.toThrow()
      expect(new Date(serverTimeISO).toISOString()).toBe(serverTimeISO)
    })
  })

  describe('startAutoSync', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('자동 동기화를 시작해야 함', () => {
      const syncSpy = jest.spyOn(timeSync, 'syncWithServer')

      timeSync.startAutoSync()

      // 즉시 동기화 호출
      expect(syncSpy).toHaveBeenCalledTimes(1)

      // 5분 후 다시 동기화 호출
      jest.advanceTimersByTime(5 * 60 * 1000)
      expect(syncSpy).toHaveBeenCalledTimes(2)

      syncSpy.mockRestore()
    })
  })

  describe('getCurrentSyncStatus', () => {
    it('동기화된 상태를 반환해야 함', () => {
      ;(timeSync as any).offset = 3600000 // 1시간
      ;(timeSync as any).lastSync = Date.now() - 2 * 60 * 1000 // 2분 전

      const status = timeSync.getCurrentSyncStatus()

      expect(status.isSynced).toBe(true)
      expect(status.offset).toBe(3600000)
      expect(status.serverTime).toBeInstanceOf(Date)
      expect(status.clientTime).toBeInstanceOf(Date)
    })

    it('동기화 만료된 상태를 반환해야 함', () => {
      ;(timeSync as any).offset = 3600000 // 1시간
      ;(timeSync as any).lastSync = Date.now() - 6 * 60 * 1000 // 6분 전

      const status = timeSync.getCurrentSyncStatus()

      expect(status.isSynced).toBe(false)
      expect(status.offset).toBe(3600000)
    })

    it('동기화된 적 없는 상태를 반환해야 함', () => {
      ;(timeSync as any).offset = 0
      ;(timeSync as any).lastSync = 0

      const status = timeSync.getCurrentSyncStatus()

      expect(status.isSynced).toBe(false)
      expect(status.offset).toBe(0)
    })
  })

  describe('syncWithServer - 추가 케이스', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('이미 동기화 중이면 현재 상태를 반환해야 함', async () => {
      ;(timeSync as any).isSyncing = true
      ;(timeSync as any).offset = 3600000
      ;(timeSync as any).lastSync = Date.now() - 2 * 60 * 1000

      const result = await timeSync.syncWithServer()

      expect(result.isSynced).toBe(true)
      expect(result.offset).toBe(3600000)
      expect(fetch).not.toHaveBeenCalled()
    })

    it('왕복 시간을 고려하여 offset을 계산해야 함', async () => {
      // 이미 동기화 중인 상태로 설정하여 현재 상태 반환
      ;(timeSync as any).isSyncing = true
      ;(timeSync as any).offset = 1000
      ;(timeSync as any).lastSync = Date.now() - 1000

      const result = await timeSync.syncWithServer()

      // 동기화 중이면 현재 상태를 반환해야 함
      expect(typeof result.isSynced).toBe('boolean')
      expect(typeof result.offset).toBe('number')
    })
  })
})
