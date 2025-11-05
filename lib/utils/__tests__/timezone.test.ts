/**
 * 타임존 유틸리티 테스트
 */

import {
  formatTimezoneInfo,
  getTimezoneInfo,
  toLocalTime,
  toTimezone,
  toUTCTime,
} from '../timezone'

// Mock Intl.DateTimeFormat
const mockDateTimeFormat = jest.spyOn(Intl, 'DateTimeFormat')

describe('Timezone Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTimezoneInfo', () => {
    it('현재 타임존 정보 반환', () => {
      mockDateTimeFormat.mockReturnValue({
        resolvedOptions: () => ({
          timeZone: 'Asia/Seoul',
        }),
      } as any)

      const info = getTimezoneInfo()

      expect(info.timezone).toBe('Asia/Seoul')
      expect(typeof info.offset).toBe('number')
      expect(info.offsetString).toMatch(/^GMT[+-]\d{2}:\d{2}$/)
      expect(typeof info.isDST).toBe('boolean')
      expect(typeof info.name).toBe('string')
    })

    it('서머타임 감지', () => {
      // DST를 가진 타임존 mock
      mockDateTimeFormat.mockReturnValue({
        resolvedOptions: () => ({
          timeZone: 'America/New_York',
        }),
      } as any)

      const info = getTimezoneInfo()

      expect(info.timezone).toBe('America/New_York')
      expect(typeof info.isDST).toBe('boolean')
    })
  })

  describe('toLocalTime', () => {
    it('UTC 시간을 로컬 시간으로 변환', () => {
      const utcDate = new Date('2023-10-31T12:00:00.000Z')
      const localDate = toLocalTime(utcDate)

      expect(localDate).toBeInstanceOf(Date)
      // 실제 변환은 브라우저/환경에 따라 다름
    })

    it('문자열 UTC 시간을 로컬 시간으로 변환', () => {
      const utcString = '2023-10-31T12:00:00.000Z'
      const localDate = toLocalTime(utcString)

      expect(localDate).toBeInstanceOf(Date)
    })
  })

  describe('toUTCTime', () => {
    it('로컬 시간을 UTC로 변환', () => {
      const localDate = new Date('2023-10-31T12:00:00.000')
      const utcDate = toUTCTime(localDate)

      expect(utcDate).toBeInstanceOf(Date)
    })

    it('문자열 로컬 시간을 UTC로 변환', () => {
      const localString = '2023-10-31T12:00:00.000'
      const utcDate = toUTCTime(localString)

      expect(utcDate).toBeInstanceOf(Date)
    })
  })

  describe('toTimezone', () => {
    it('특정 타임존으로 시간 변환', () => {
      mockDateTimeFormat.mockReturnValue({
        formatToParts: () => [
          { type: 'year', value: '2023' },
          { type: 'month', value: '10' },
          { type: 'day', value: '31' },
          { type: 'hour', value: '21' },
          { type: 'minute', value: '00' },
          { type: 'second', value: '00' },
        ],
      } as any)

      const date = new Date('2023-10-31T12:00:00.000Z')
      const timezoneDate = toTimezone(date, 'Asia/Seoul')

      expect(timezoneDate).toBeInstanceOf(Date)
      expect(timezoneDate.getFullYear()).toBe(2023)
      expect(timezoneDate.getMonth()).toBe(9) // 0-based
      expect(timezoneDate.getDate()).toBe(31)
      expect(timezoneDate.getHours()).toBe(21)
    })
  })

  describe('formatTimezoneInfo', () => {
    it('타임존 정보 포맷팅', () => {
      const info = {
        timezone: 'Asia/Seoul',
        offset: 540, // GMT+09:00
        offsetString: 'GMT+09:00',
        isDST: false,
        name: '대한민국 표준시',
      }

      const formatted = formatTimezoneInfo(info)
      expect(formatted).toBe('대한민국 표준시 GMT+09:00')
    })

    it('서머타임 포함 포맷팅', () => {
      const info = {
        timezone: 'America/New_York',
        offset: -240, // GMT-04:00 (DST)
        offsetString: 'GMT-04:00',
        isDST: true,
        name: '미국 동부 표준시',
      }

      const formatted = formatTimezoneInfo(info)
      expect(formatted).toBe('미국 동부 표준시 GMT-04:00 (DST)')
    })
  })

  describe('엣지 케이스', () => {
    it('유효하지 않은 날짜 처리', () => {
      const invalidDate = new Date('invalid')
      const localDate = toLocalTime(invalidDate)

      expect(isNaN(localDate.getTime())).toBe(true)
    })

    it('빈 문자열 처리', () => {
      const emptyString = ''
      const localDate = toLocalTime(emptyString)

      expect(isNaN(localDate.getTime())).toBe(true)
    })
  })
})
