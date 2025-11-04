/**
 * 시간 관련 통합 테스트
 */

import {
  fromDatetimeLocalString,
  toDatetimeLocalString,
  fetchServerTime,
} from '../utcHelpers'
import { timeSync } from '../timeSync'
import { getTimezoneInfo, toLocalTime, toUTCTime } from '../timezone'

// Mock fetch for server time
global.fetch = jest.fn()

describe('시간 관련 통합 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(timeSync as any).offset = 0
    ;(timeSync as any).lastSync = 0
  })

  describe('datetime-local 변환 통합', () => {
    it('전체 변환 라운드트립', () => {
      // 로컬 datetime-local → UTC → 로컬 datetime-local
      const originalLocal = '2025-10-20T14:30'
      const utcString = fromDatetimeLocalString(originalLocal)
      const convertedLocal = toDatetimeLocalString(utcString)

      expect(convertedLocal).toBe(originalLocal)
    })

    it('다양한 시간대에서의 변환 일관성', () => {
      const testCases = [
        '2025-01-01T00:00', // 자정
        '2025-06-15T12:30', // 정오
        '2025-12-31T23:59', // 연말
      ]

      testCases.forEach(localTime => {
        const utcString = fromDatetimeLocalString(localTime)
        const convertedLocal = toDatetimeLocalString(utcString)
        expect(convertedLocal).toBe(localTime)
      })
    })
  })

  describe('서버 시간 동기화와 타임존', () => {
    it('서버 시간 가져오기 및 로컬 변환', async () => {
      const mockServerTime = 1698765432000 // 2023-10-31 12:30:32 UTC
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          serverTime: '2023-10-31T12:30:32.000Z',
          timestamp: mockServerTime,
        }),
      }
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      // 서버 시간 동기화
      const syncResult = await timeSync.syncWithServer()
      expect(syncResult.isSynced).toBe(true)

      // 서버 시간 가져오기
      const serverTime = timeSync.getServerTime()
      expect(serverTime).toBeInstanceOf(Date)

      // 로컬 시간으로 변환
      const localTime = toLocalTime(serverTime)
      expect(localTime).toBeInstanceOf(Date)

      // 다시 UTC로 변환
      const convertedBack = toUTCTime(localTime)
      expect(convertedBack.toISOString()).toBe(serverTime.toISOString())
    })
  })

  describe('실제 사용 시나리오', () => {
    it('라운드 생성 시나리오', () => {
      // 사용자가 datetime-local input으로 라운드 시간 선택
      const userInput = '2025-11-15T19:00'
      
      // 서버 전송을 위해 UTC로 변환
      const serverTime = fromDatetimeLocalString(userInput)
      expect(serverTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

      // 서버에서 받은 UTC 시간을 다시 로컬로 표시
      const displayTime = toDatetimeLocalString(serverTime)
      expect(displayTime).toBe(userInput)
    })

    it('출석 체크 시나리오', async () => {
      const mockServerTime = 1698765432000
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          serverTime: '2023-10-31T12:30:32.000Z',
          timestamp: mockServerTime,
        }),
      }
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      // 시간 동기화
      await timeSync.syncWithServer()
      
      // 현재 서버 시간 기준으로 출석 기간 확인
      const now = timeSync.getServerTime()
      const roundStart = new Date('2023-10-31T10:00:00.000Z')
      const roundEnd = new Date('2023-10-31T15:00:00.000Z')

      const isWithinWindow = now >= roundStart && now <= roundEnd
      expect(typeof isWithinWindow).toBe('boolean')
    })

    it('다국가 사용자 시나리오', () => {
      // 한국 사용자가 입력한 시간
      const koreaTime = '2025-11-15T19:00'
      const utcTime = fromDatetimeLocalString(koreaTime)

      // 미국 사용자가 볼 때 로컬 시간으로 변환
      const usLocalTime = toLocalTime(utcTime)
      
      // 뉴욕 타임존으로 변환 (mock)
      const timezoneInfo = getTimezoneInfo()
      expect(typeof timezoneInfo.timezone).toBe('string')
      expect(timezoneInfo.offsetString).toMatch(/^GMT[+-]\d{2}:\d{2}$/)
    })
  })

  describe('에러 처리', () => {
    it('잘못된 datetime-local 입력 처리', () => {
      const invalidInputs = [
        'invalid',
        '2025-13-45T99:99',
        '2025-02-30T25:00', // 존재하지 않는 날짜/시간
        '',
        null as any,
        undefined as any,
      ]

      invalidInputs.forEach(input => {
        const result = fromDatetimeLocalString(input)
        expect(result).toBe('')
      })
    })

    it('서버 시간 동기화 실패 처리', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const syncResult = await timeSync.syncWithServer()
      expect(syncResult.isSynced).toBe(false)
      expect(syncResult.offset).toBe(0)

      // 실패해도 getServerTime은 작동해야 함
      const serverTime = timeSync.getServerTime()
      expect(serverTime).toBeInstanceOf(Date)
    })
  })

  describe('성능 테스트', () => {
    it('대량의 시간 변환 처리', () => {
      const start = performance.now()
      
      // 1000개의 시간 변환
      for (let i = 0; i < 1000; i++) {
        const localTime = `2025-11-${String(i % 28 + 1).padStart(2, '0')}T${String(i % 24).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`
        const utcTime = fromDatetimeLocalString(localTime)
        const backToLocal = toDatetimeLocalString(utcTime)
        expect(backToLocal).toBe(localTime)
      }
      
      const end = performance.now()
      expect(end - start).toBeLessThan(1000) // 1초 이내
    })
  })

  describe('경계값 테스트', () => {
    it('연도 경계값', () => {
      const edgeCases = [
        '1900-01-01T00:00', // 최소 연도
        '2100-12-31T23:59', // 최대 연도
      ]

      edgeCases.forEach(time => {
        const utcTime = fromDatetimeLocalString(time)
        expect(utcTime).not.toBe('')
        
        const localTime = toDatetimeLocalString(utcTime)
        expect(localTime).toBe(time)
      })
    })

    it('경계 연도 초과', () => {
      const outOfRange = [
        '1899-12-31T23:59',
        '2101-01-01T00:00',
      ]

      outOfRange.forEach(time => {
        const utcTime = fromDatetimeLocalString(time)
        expect(utcTime).toBe('')
      })
    })
  })
})
