import { getUTCDayRange } from '@/lib/utils'

describe('Calendar Date String & Month Boundary Range', () => {
  it('YYYY-MM-DD 문자열을 파싱하여 월 경계(예: 10월 말 -> 11월 1일)에서도 해당 월의 범위를 정확히 계산해야 한다', () => {
    const selectedDate = '2026-11-01'
    const [yearStr, monthStr, dayStr] = selectedDate.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10) - 1
    const day = parseInt(dayStr, 10)

    const targetDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
    const { start, end } = getUTCDayRange(targetDate)

    expect(start.toISOString()).toBe('2026-11-01T00:00:00.000Z')
    expect(end.toISOString()).toBe('2026-11-01T23:59:59.999Z')
  })
})
