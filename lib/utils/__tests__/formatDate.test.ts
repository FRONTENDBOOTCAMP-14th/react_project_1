/**
 * formatDate 유틸리티 테스트
 */

import formatDate, {
  formatDateRange,
  formatDateRangeUTC,
  formatDateUTC,
  formatDiffFromNow,
} from '../formatDate'

describe('formatDate utilities', () => {
  describe('formatDate', () => {
    it('null/undefined 입력은 빈 문자열을 반환해야 함', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
    })

    it('유효하지 않은 날짜는 빈 문자열을 반환해야 함', () => {
      expect(formatDate('invalid-date')).toBe('')
      expect(formatDate('2023-13-45T99:99:99.999Z')).toBe('')
    })

    it('Date 객체를 포맷팅해야 함', () => {
      const date = new Date('2024-01-15T14:30:00.000Z')
      const result = formatDate(date)
      // UTC 시간이 로컬 시간으로 변환됨 (KST: UTC+9)
      expect(result).toBe('2024년 1월 15일 23:30')
    })

    it('ISO 문자열을 포맷팅해야 함', () => {
      const result = formatDate('2024-01-15T14:30:00.000Z')
      expect(result).toBe('2024년 1월 15일 23:30')
    })

    it('시간을 포함하지 않을 수 있어야 함', () => {
      const date = new Date('2024-01-15T14:30:00.000Z')
      const result = formatDate(date, false)
      expect(result).toBe('2024년 1월 15일')
    })

    it('한 자리 숫자는 0을 앞에 붙여야 함', () => {
      const date = new Date('2024-01-05T09:05:00.000Z')
      const result = formatDate(date)
      expect(result).toBe('2024년 1월 5일 18:05')
    })

    it('자정을 올바르게 표시해야 함', () => {
      const date = new Date('2024-01-15T00:00:00.000Z')
      const result = formatDate(date)
      expect(result).toBe('2024년 1월 15일 09:00')
    })

    it('월과 일이 10 미만일 때 올바르게 표시해야 함', () => {
      const date = new Date('2024-03-07T12:00:00.000Z')
      const result = formatDate(date)
      expect(result).toBe('2024년 3월 7일 21:00')
    })
  })

  describe('formatDateRange', () => {
    it('모든 입력이 null이면 빈 문자열을 반환해야 함', () => {
      expect(formatDateRange(null, null)).toBe('')
      expect(formatDateRange(undefined, undefined)).toBe('')
    })

    it('시작일만 있으면 시작일만 표시해야 함', () => {
      const start = '2024-01-15T14:30:00.000Z'
      const result = formatDateRange(start, null)
      expect(result).toBe('2024년 1월 15일 23:30 ~')
    })

    it('종료일만 있으면 종료일만 표시해야 함', () => {
      const end = '2024-01-20T18:00:00.000Z'
      const result = formatDateRange(null, end)
      expect(result).toBe('~ 2024년 1월 21일 03:00')
    })

    it('같은 날짜의 시간 범위를 올바르게 표시해야 함', () => {
      const start = '2024-01-15T14:30:00.000Z'
      const end = '2024-01-15T18:00:00.000Z'
      const result = formatDateRange(start, end)
      expect(result).toBe('2024년 1월 15일 23:30 ~ 2024년 1월 16일 03:00')
    })

    it('다른 날짜 범위를 올바르게 표시해야 함', () => {
      const start = '2024-01-15T14:30:00.000Z'
      const end = '2024-01-20T18:00:00.000Z'
      const result = formatDateRange(start, end)
      expect(result).toBe('2024년 1월 15일 23:30 ~ 2024년 1월 21일 03:00')
    })

    it('시간을 포함하지 않을 수 있어야 함', () => {
      const start = '2024-01-15T00:00:00.000Z'
      const end = '2024-01-20T00:00:00.000Z'
      const result = formatDateRange(start, end, false)
      expect(result).toBe('2024년 1월 15일 ~ 2024년 1월 20일')
    })

    it('같은 날짜지만 시간을 포함하지 않으면 전체 날짜를 표시해야 함', () => {
      const start = '2024-01-15T14:30:00.000Z'
      const end = '2024-01-15T18:00:00.000Z'
      const result = formatDateRange(start, end, false)
      expect(result).toBe('2024년 1월 15일 ~ 2024년 1월 16일')
    })

    it('Date 객체도 처리해야 함', () => {
      const start = new Date('2024-01-15T14:30:00.000Z')
      const end = new Date('2024-01-20T18:00:00.000Z')
      const result = formatDateRange(start, end)
      expect(result).toBe('2024년 1월 15일 23:30 ~ 2024년 1월 21일 03:00')
    })
  })

  describe('formatDiffFromNow', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('null/undefined 입력은 빈 문자열을 반환해야 함', () => {
      expect(formatDiffFromNow(null)).toBe('')
      expect(formatDiffFromNow(undefined)).toBe('')
    })

    it('유효하지 않은 날짜는 빈 문자열을 반환해야 함', () => {
      expect(formatDiffFromNow('invalid-date')).toBe('')
    })

    it('미래 시간은 빈 문자열을 반환해야 함', () => {
      const future = new Date(Date.now() + 60000) // 1분 후
      expect(formatDiffFromNow(future)).toBe('')
    })

    it('방금 전을 표시해야 함', () => {
      const now = new Date()
      jest.setSystemTime(now)
      expect(formatDiffFromNow(now)).toBe('방금 전')
    })

    it('초 단위를 표시해야 함', () => {
      const now = new Date('2024-01-15T12:00:00.000Z')
      const past = new Date('2024-01-15T11:59:30.000Z') // 30초 전
      jest.setSystemTime(now)
      expect(formatDiffFromNow(past)).toBe('30초 전')
    })

    it('분 단위를 표시해야 함', () => {
      const now = new Date('2024-01-15T12:00:00.000Z')
      const past = new Date('2024-01-15T11:30:00.000Z') // 30분 전
      jest.setSystemTime(now)
      expect(formatDiffFromNow(past)).toBe('30분 전')
    })

    it('시간 단위를 표시해야 함', () => {
      const now = new Date('2024-01-15T12:00:00.000Z')
      const past = new Date('2024-01-15T06:00:00.000Z') // 6시간 전
      jest.setSystemTime(now)
      expect(formatDiffFromNow(past)).toBe('6시간 전')
    })

    it('일 단위를 표시해야 함', () => {
      const now = new Date('2024-01-15T12:00:00.000Z')
      const past = new Date('2024-01-13T12:00:00.000Z') // 2일 전
      jest.setSystemTime(now)
      expect(formatDiffFromNow(past)).toBe('2일 전')
    })

    it('문자열 날짜도 처리해야 함', () => {
      const now = new Date('2024-01-15T12:00:00.000Z')
      jest.setSystemTime(now)
      expect(formatDiffFromNow('2024-01-15T11:30:00.000Z')).toBe('30분 전')
    })
  })

  describe('formatDateUTC', () => {
    it('null/undefined 입력은 빈 문자열을 반환해야 함', () => {
      expect(formatDateUTC(null)).toBe('')
      expect(formatDateUTC(undefined)).toBe('')
    })

    it('유효하지 않은 날짜는 빈 문자열을 반환해야 함', () => {
      expect(formatDateUTC('invalid-date')).toBe('')
    })

    it('UTC 시간을 올바르게 포맷팅해야 함', () => {
      // 로컬 시간과 다른 UTC 시간
      const date = new Date('2024-01-15T14:30:00.000Z')
      const result = formatDateUTC(date)
      expect(result).toBe('2024년 1월 15일 14:30')
    })

    it('시간을 포함하지 않을 수 있어야 함', () => {
      const date = new Date('2024-01-15T14:30:00.000Z')
      const result = formatDateUTC(date, false)
      expect(result).toBe('2024년 1월 15일')
    })

    it('한 자리 숫자는 0을 앞에 붙여야 함', () => {
      const date = new Date('2024-01-05T09:05:00.000Z')
      const result = formatDateUTC(date)
      expect(result).toBe('2024년 1월 5일 09:05')
    })

    it('문자열 날짜도 처리해야 함', () => {
      const result = formatDateUTC('2024-01-15T14:30:00.000Z')
      expect(result).toBe('2024년 1월 15일 14:30')
    })
  })

  describe('formatDateRangeUTC', () => {
    it('모든 입력이 null이면 빈 문자열을 반환해야 함', () => {
      expect(formatDateRangeUTC(null, null)).toBe('')
    })

    it('시작일만 있으면 시작일만 표시해야 함', () => {
      const start = '2024-01-15T14:30:00.000Z'
      const result = formatDateRangeUTC(start, null)
      expect(result).toBe('2024년 1월 15일 14:30 ~')
    })

    it('종료일만 있으면 종료일만 표시해야 함', () => {
      const end = '2024-01-20T18:00:00.000Z'
      const result = formatDateRangeUTC(null, end)
      expect(result).toBe('~ 2024년 1월 20일 18:00')
    })

    it('같은 날짜의 시간 범위를 올바르게 표시해야 함', () => {
      const start = '2024-01-15T14:30:00.000Z'
      const end = '2024-01-15T18:00:00.000Z'
      const result = formatDateRangeUTC(start, end)
      expect(result).toBe('2024년 1월 15일 14:30 ~ 18:00')
    })

    it('다른 날짜 범위를 올바르게 표시해야 함', () => {
      const start = '2024-01-15T14:30:00.000Z'
      const end = '2024-01-20T18:00:00.000Z'
      const result = formatDateRangeUTC(start, end)
      expect(result).toBe('2024년 1월 15일 14:30 ~ 2024년 1월 20일 18:00')
    })

    it('시간을 포함하지 않을 수 있어야 함', () => {
      const start = '2024-01-15T00:00:00.000Z'
      const end = '2024-01-20T00:00:00.000Z'
      const result = formatDateRangeUTC(start, end, false)
      expect(result).toBe('2024년 1월 15일 ~ 2024년 1월 20일')
    })

    it('Date 객체도 처리해야 함', () => {
      const start = new Date('2024-01-15T14:30:00.000Z')
      const end = new Date('2024-01-20T18:00:00.000Z')
      const result = formatDateRangeUTC(start, end)
      expect(result).toBe('2024년 1월 15일 14:30 ~ 2024년 1월 20일 18:00')
    })
  })
})
