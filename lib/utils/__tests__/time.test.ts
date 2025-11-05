/**
 * time.ts 유틸리티 테스트
 */

import {
  formatRoundPeriod,
  formatTime,
  getDaysDifference,
  getDday,
  getRelativeTime,
  isThisMonth,
  isThisWeek,
  isToday,
} from '../time'

describe('time utilities', () => {
  // 고정된 현재 시간을 사용
  const MOCK_NOW = new Date('2024-01-15T12:00:00Z')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(MOCK_NOW)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('getRelativeTime', () => {
    it('60초 미만이면 "방금 전"을 반환해야 함', () => {
      const date = new Date(MOCK_NOW.getTime() - 30 * 1000) // 30초 전
      expect(getRelativeTime(date)).toBe('방금 전')
    })

    it('1시간 미만이면 "N분 전"을 반환해야 함', () => {
      const date = new Date(MOCK_NOW.getTime() - 5 * 60 * 1000) // 5분 전
      expect(getRelativeTime(date)).toBe('5분 전')

      const date2 = new Date(MOCK_NOW.getTime() - 45 * 60 * 1000) // 45분 전
      expect(getRelativeTime(date2)).toBe('45분 전')
    })

    it('24시간 미만이면 "N시간 전"을 반환해야 함', () => {
      const date = new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000) // 2시간 전
      expect(getRelativeTime(date)).toBe('2시간 전')

      const date2 = new Date(MOCK_NOW.getTime() - 12 * 60 * 60 * 1000) // 12시간 전
      expect(getRelativeTime(date2)).toBe('12시간 전')
    })

    it('7일 미만이면 "N일 전"을 반환해야 함', () => {
      const date = new Date(MOCK_NOW.getTime() - 3 * 24 * 60 * 60 * 1000) // 3일 전
      expect(getRelativeTime(date)).toBe('3일 전')
    })

    it('4주 미만이면 "N주 전"을 반환해야 함', () => {
      const date = new Date(MOCK_NOW.getTime() - 14 * 24 * 60 * 60 * 1000) // 2주 전
      expect(getRelativeTime(date)).toBe('2주 전')
    })

    it('4주 이상이면 날짜를 반환해야 함', () => {
      const date = new Date(MOCK_NOW.getTime() - 40 * 24 * 60 * 60 * 1000) // 40일 전
      const result = getRelativeTime(date)

      expect(result).toContain('2023') // 년도 포함
    })

    it('문자열 날짜도 처리해야 함', () => {
      const dateStr = new Date(MOCK_NOW.getTime() - 10 * 60 * 1000).toISOString()
      expect(getRelativeTime(dateStr)).toBe('10분 전')
    })
  })

  describe('getDday', () => {
    it('오늘이면 0을 반환해야 함', () => {
      const today = new Date(MOCK_NOW)
      expect(getDday(today)).toBe(0)
    })

    it('내일이면 1을 반환해야 함', () => {
      const tomorrow = new Date(MOCK_NOW)
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(getDday(tomorrow)).toBe(1)
    })

    it('과거 날짜면 음수를 반환해야 함', () => {
      const yesterday = new Date(MOCK_NOW)
      yesterday.setDate(yesterday.getDate() - 1)
      expect(getDday(yesterday)).toBe(-1)
    })

    it('7일 후면 7을 반환해야 함', () => {
      const future = new Date(MOCK_NOW)
      future.setDate(future.getDate() + 7)
      expect(getDday(future)).toBe(7)
    })

    it('문자열 날짜도 처리해야 함', () => {
      const tomorrow = new Date(MOCK_NOW)
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(getDday(tomorrow.toISOString())).toBe(1)
    })
  })

  describe('isToday', () => {
    it('오늘 날짜면 true를 반환해야 함', () => {
      const today = new Date(MOCK_NOW)
      expect(isToday(today)).toBe(true)
    })

    it('같은 날짜지만 다른 시간이어도 true를 반환해야 함', () => {
      const todayMorning = new Date('2024-01-15T08:00:00Z')
      const todayEvening = new Date('2024-01-15T20:00:00Z')

      expect(isToday(todayMorning)).toBe(true)
      expect(isToday(todayEvening)).toBe(true)
    })

    it('어제면 false를 반환해야 함', () => {
      const yesterday = new Date(MOCK_NOW)
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isToday(yesterday)).toBe(false)
    })

    it('내일이면 false를 반환해야 함', () => {
      const tomorrow = new Date(MOCK_NOW)
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(isToday(tomorrow)).toBe(false)
    })

    it('문자열 날짜도 처리해야 함', () => {
      expect(isToday('2024-01-15T15:30:00Z')).toBe(true)
      expect(isToday('2024-01-14T15:30:00Z')).toBe(false)
    })
  })

  describe('isThisWeek', () => {
    it('이번 주면 true를 반환해야 함', () => {
      // 2024-01-15는 월요일
      const monday = new Date('2024-01-15T00:00:00Z')
      expect(isThisWeek(monday)).toBe(true)
    })

    it('저번 주면 false를 반환해야 함', () => {
      const lastWeek = new Date(MOCK_NOW)
      lastWeek.setDate(lastWeek.getDate() - 7)
      expect(isThisWeek(lastWeek)).toBe(false)
    })

    it('다음 주면 false를 반환해야 함', () => {
      const nextWeek = new Date(MOCK_NOW)
      nextWeek.setDate(nextWeek.getDate() + 7)
      expect(isThisWeek(nextWeek)).toBe(false)
    })
  })

  describe('isThisMonth', () => {
    it('이번 달이면 true를 반환해야 함', () => {
      const thisMonth = new Date('2024-01-20T00:00:00Z')
      expect(isThisMonth(thisMonth)).toBe(true)
    })

    it('저번 달이면 false를 반환해야 함', () => {
      const lastMonth = new Date('2023-12-15T00:00:00Z')
      expect(isThisMonth(lastMonth)).toBe(false)
    })

    it('다음 달이면 false를 반환해야 함', () => {
      const nextMonth = new Date('2024-02-15T00:00:00Z')
      expect(isThisMonth(nextMonth)).toBe(false)
    })

    it('같은 달 다른 날짜도 true를 반환해야 함', () => {
      const firstDay = new Date('2024-01-01T00:00:00Z')
      const lastDay = new Date('2024-01-31T00:00:00Z')

      expect(isThisMonth(firstDay)).toBe(true)
      expect(isThisMonth(lastDay)).toBe(true)
    })
  })

  describe('getDaysDifference', () => {
    it('같은 날짜면 0을 반환해야 함', () => {
      const date = new Date('2024-01-15')
      expect(getDaysDifference(date, date)).toBe(0)
    })

    it('하루 차이면 1을 반환해야 함', () => {
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-16')
      expect(getDaysDifference(start, end)).toBe(1)
    })

    it('7일 차이면 7을 반환해야 함', () => {
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-22')
      expect(getDaysDifference(start, end)).toBe(7)
    })

    it('역순으로 입력해도 음수를 반환해야 함', () => {
      const start = new Date('2024-01-20')
      const end = new Date('2024-01-15')
      expect(getDaysDifference(start, end)).toBe(-5)
    })

    it('시간은 무시하고 날짜만 계산해야 함', () => {
      const start = new Date('2024-01-15T08:00:00Z')
      const end = new Date('2024-01-16T20:00:00Z')
      expect(getDaysDifference(start, end)).toBe(1)
    })

    it('문자열 날짜도 처리해야 함', () => {
      expect(getDaysDifference('2024-01-15', '2024-01-20')).toBe(5)
    })
  })

  describe('formatRoundPeriod', () => {
    it('1일 이하 기간은 시작일만 표시해야 함', () => {
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-15')
      const result = formatRoundPeriod(start, end)

      expect(result).not.toContain('~')
      expect(result).toContain('2024년 1월 15일')
      expect(result).not.toMatch(/\s\d+일\)$/) // " (N일)" 형태가 아니어야 함
    })

    it('여러 날짜는 기간과 일수를 표시해야 함', () => {
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-22')
      const result = formatRoundPeriod(start, end)

      expect(result).toContain('~')
      expect(result).toContain('7일')
    })
  })

  describe('formatTime', () => {
    it('시간을 HH:mm 형식으로 포맷해야 함', () => {
      const date = new Date('2024-01-15T14:30:00Z')
      const result = formatTime(date)

      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('한 자리 숫자는 0을 앞에 붙여야 함', () => {
      const date = new Date('2024-01-15T09:05:00Z')
      const result = formatTime(date)

      expect(result).toContain('09')
      expect(result).toContain('05')
    })

    it('자정을 올바르게 표시해야 함', () => {
      const midnight = new Date('2024-01-15T00:00:00Z')
      const result = formatTime(midnight)

      expect(result).toContain('00:00')
    })

    it('문자열 날짜도 처리해야 함', () => {
      const result = formatTime('2024-01-15T15:45:00Z')

      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })
  })
})
