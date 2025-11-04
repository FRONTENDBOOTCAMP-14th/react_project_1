/**
 * UTC 헬퍼 함수 테스트
 * 특히 datetime-local 변환 함수의 시간대 처리를 검증
 */

import {
  fetchServerTime,
  fromDatetimeLocalString,
  fromUTC,
  getUTCDayRange,
  getUTCMonthRange,
  toDatetimeLocalString,
  toUTC,
} from '../utcHelpers'

describe('UTC Helpers - datetime-local 변환', () => {
  describe('toDatetimeLocalString', () => {
    it('UTC 시간을 로컬 시간으로 변환하여 datetime-local 형식 반환', () => {
      // Given: UTC 시간
      const utcDateString = '2025-10-20T05:30:00.000Z'

      // When: datetime-local 형식으로 변환
      const result = toDatetimeLocalString(utcDateString)

      // Then: 로컬 시간대로 변환되어야 함
      // 주의: 실제 결과는 테스트 실행 환경의 시간대에 따라 다름
      // 한국(UTC+9)에서 실행 시: '2025-10-20T14:30'
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)

      // 변환된 시간을 다시 Date로 만들어서 원본과 같은 시점을 가리키는지 확인
      const parsedDate = new Date(result + ':00')
      const originalDate = new Date(utcDateString)
      expect(parsedDate.getTime()).toBe(originalDate.getTime())
    })

    it('빈 값이나 null에 대해 빈 문자열 반환', () => {
      expect(toDatetimeLocalString(null)).toBe('')
      expect(toDatetimeLocalString(undefined)).toBe('')
      expect(toDatetimeLocalString('')).toBe('')
    })

    it('유효하지 않은 날짜에 대해 빈 문자열 반환', () => {
      expect(toDatetimeLocalString('invalid-date')).toBe('')
    })
  })

  describe('fromDatetimeLocalString', () => {
    it('로컬 datetime-local 값을 UTC ISO 문자열로 변환', () => {
      // Given: datetime-local 형식 입력 (로컬 시간)
      const localDatetimeString = '2025-10-20T14:30'

      // When: UTC ISO 문자열로 변환
      const result = fromDatetimeLocalString(localDatetimeString)

      // Then: ISO 8601 UTC 형식이어야 함
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

      // 변환된 UTC 시간을 로컬 Date로 파싱하면 원본 시간과 일치해야 함
      const parsedDate = new Date(result)
      expect(parsedDate.getFullYear()).toBe(2025)
      expect(parsedDate.getMonth()).toBe(9) // 0-indexed
      expect(parsedDate.getDate()).toBe(20)
      expect(parsedDate.getHours()).toBe(14)
      expect(parsedDate.getMinutes()).toBe(30)
    })

    it('빈 값에 대해 빈 문자열 반환', () => {
      expect(fromDatetimeLocalString('')).toBe('')
    })

    it('유효하지 않은 날짜에 대해 빈 문자열 반환', () => {
      expect(fromDatetimeLocalString('invalid')).toBe('')
      expect(fromDatetimeLocalString('2025-13-45T99:99')).toBe('')
    })
  })

  describe('왕복 변환 테스트 (Round-trip)', () => {
    it('UTC → 로컬 → UTC 변환이 원본을 보존해야 함', () => {
      // Given: 원본 UTC 시간
      const originalUTC = '2025-10-20T05:30:00.000Z'

      // When: UTC → datetime-local → UTC 변환
      const localString = toDatetimeLocalString(originalUTC)
      const backToUTC = fromDatetimeLocalString(localString)

      // Then: 원본과 동일한 시점을 가리켜야 함
      const originalTime = new Date(originalUTC).getTime()
      const resultTime = new Date(backToUTC).getTime()
      expect(resultTime).toBe(originalTime)
    })

    it('로컬 → UTC → 로컬 변환이 원본을 보존해야 함', () => {
      // Given: datetime-local 형식 입력
      const originalLocal = '2025-10-20T14:30'

      // When: datetime-local → UTC → datetime-local 변환
      const utcString = fromDatetimeLocalString(originalLocal)
      const backToLocal = toDatetimeLocalString(utcString)

      // Then: 원본과 동일해야 함
      expect(backToLocal).toBe(originalLocal)
    })
  })

  describe('실제 사용 시나리오', () => {
    it('사용자가 Round 시작일을 입력하고 서버로 전송하는 플로우', () => {
      // Given: 사용자가 datetime-local input에 입력한 값
      const userInput = '2025-12-25T09:00' // 크리스마스 아침 9시

      // When: 서버로 전송하기 위해 UTC로 변환
      const utcForServer = fromDatetimeLocalString(userInput)

      // Then: UTC ISO 형식이어야 함
      expect(utcForServer).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

      // And: 서버에서 받은 UTC 시간을 다시 표시할 때
      const displayValue = toDatetimeLocalString(utcForServer)

      // Then: 사용자가 입력한 원본 값과 동일해야 함
      expect(displayValue).toBe(userInput)
    })

    it('다른 시간대 사용자가 동일한 UTC 시간을 보는 시나리오', () => {
      // Given: 서버에 저장된 UTC 시간 (예: 회의 시작 시간)
      const serverUTC = '2025-11-15T01:00:00.000Z' // UTC 새벽 1시

      // When: 각 지역 사용자가 이 시간을 datetime-local로 변환
      const localDisplay = toDatetimeLocalString(serverUTC)

      // Then: 형식은 올바르고
      expect(localDisplay).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)

      // And: 다시 UTC로 변환하면 동일한 시점을 가리켜야 함
      const backToUTC = fromDatetimeLocalString(localDisplay)
      expect(new Date(backToUTC).getTime()).toBe(new Date(serverUTC).getTime())
    })
  })
})

describe('UTC Helpers - 기타 함수들', () => {
  describe('fetchServerTime', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('서버 시간을 성공적으로 가져와야 함', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          timestamp: 1698744000000, // 2023-10-31T12:00:00.000Z
        }),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await fetchServerTime()

      expect(global.fetch).toHaveBeenCalledWith('/api/server-time')
      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBe(1698744000000)
    })

    it('서버 응답 실패 시 클라이언트 시간을 반환해야 함', async () => {
      const mockResponse = {
        ok: false,
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await fetchServerTime()

      expect(consoleSpy).toHaveBeenCalledWith('서버 시간 가져오기 실패:', expect.any(Error))
      expect(result).toBeInstanceOf(Date)
      expect(Math.abs(result.getTime() - Date.now())).toBeLessThan(1000)

      consoleSpy.mockRestore()
    })

    it('네트워크 에러 시 클라이언트 시간을 반환해야 함', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await fetchServerTime()

      expect(consoleSpy).toHaveBeenCalledWith('서버 시간 가져오기 실패:', expect.any(Error))
      expect(result).toBeInstanceOf(Date)

      consoleSpy.mockRestore()
    })
  })

  describe('toUTC', () => {
    it('로컬 Date를 UTC 기준으로 변환해야 함', () => {
      const localDate = new Date(2025, 9, 20, 14, 30, 0, 0) // 2025-10-20 14:30:00 로컬
      const utcDate = toUTC(localDate)

      expect(utcDate).toBeInstanceOf(Date)
      expect(utcDate.getUTCFullYear()).toBe(2025)
      expect(utcDate.getUTCMonth()).toBe(9) // 0-based, 9 = 10월
      expect(utcDate.getUTCDate()).toBe(20)
      expect(utcDate.getUTCHours()).toBe(14)
      expect(utcDate.getUTCMinutes()).toBe(30)
    })

    it('밀리초도 보존해야 함', () => {
      const localDate = new Date(2025, 9, 20, 14, 30, 45, 123)
      const utcDate = toUTC(localDate)

      expect(utcDate.getUTCSeconds()).toBe(45)
      expect(utcDate.getUTCMilliseconds()).toBe(123)
    })
  })

  describe('fromUTC', () => {
    it('ISO 문자열을 Date 객체로 파싱해야 함', () => {
      const isoString = '2025-10-20T14:30:00.000Z'
      const date = fromUTC(isoString)

      expect(date).toBeInstanceOf(Date)
      expect(date.toISOString()).toBe(isoString)
    })

    it('다양한 ISO 형식을 처리해야 함', () => {
      const cases = [
        '2025-10-20T14:30:00Z',
        '2025-10-20T14:30:00.123Z',
        '2025-10-20T14:30:00+00:00',
      ]

      cases.forEach(isoString => {
        const date = fromUTC(isoString)
        expect(date).toBeInstanceOf(Date)
        expect(date.getTime()).not.toBeNaN()
      })
    })
  })

  describe('getUTCDayRange', () => {
    it('해당 날짜의 UTC 시작과 끝을 반환해야 함', () => {
      const date = new Date('2025-10-20T14:30:00.000Z')
      const { start, end } = getUTCDayRange(date)

      expect(start.toISOString()).toBe('2025-10-20T00:00:00.000Z')
      expect(end.toISOString()).toBe('2025-10-20T23:59:59.999Z')
    })

    it('다른 날짜도 올바르게 처리해야 함', () => {
      const date = new Date('2025-01-01T12:00:00.000Z')
      const { start, end } = getUTCDayRange(date)

      expect(start.toISOString()).toBe('2025-01-01T00:00:00.000Z')
      expect(end.toISOString()).toBe('2025-01-01T23:59:59.999Z')
    })
  })

  describe('getUTCMonthRange', () => {
    it('해당 월의 UTC 시작과 끝을 반환해야 함', () => {
      const date = new Date('2025-10-20T14:30:00.000Z')
      const { start, end } = getUTCMonthRange(date)

      expect(start.toISOString()).toBe('2025-10-01T00:00:00.000Z')
      expect(end.toISOString()).toBe('2025-10-31T23:59:59.999Z')
    })

    it('2월도 올바르게 처리해야 함 (윤년)', () => {
      const date = new Date('2024-02-15T12:00:00.000Z') // 윤년
      const { start, end } = getUTCMonthRange(date)

      expect(start.toISOString()).toBe('2024-02-01T00:00:00.000Z')
      expect(end.toISOString()).toBe('2024-02-29T23:59:59.999Z')
    })

    it('2월도 올바르게 처리해야 함 (평년)', () => {
      const date = new Date('2023-02-15T12:00:00.000Z') // 평년
      const { start, end } = getUTCMonthRange(date)

      expect(start.toISOString()).toBe('2023-02-01T00:00:00.000Z')
      expect(end.toISOString()).toBe('2023-02-28T23:59:59.999Z')
    })
  })
})
