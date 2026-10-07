import { getLocalDateRange, isRoundOnLocalDate } from '@/lib/utils'

describe('Calendar and Carousel Local Time Sync', () => {
  it('YYYY-MM-DD 키에 대해 로컬 자정부터 23:59:59.999까지의 범위를 생성해야 한다', () => {
    const { start, end } = getLocalDateRange('2026-10-07')

    expect(start.getFullYear()).toBe(2026)
    expect(start.getMonth()).toBe(9) // 0-indexed October
    expect(start.getDate()).toBe(7)
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)

    expect(end.getFullYear()).toBe(2026)
    expect(end.getMonth()).toBe(9)
    expect(end.getDate()).toBe(7)
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
  })

  it('해당 로컬 일자에 시작하는 라운드는 true를 반환해야 한다', () => {
    // 2026-10-07 10:00 로컬 시간 생성
    const roundDate = new Date(2026, 9, 7, 10, 0, 0)
    expect(isRoundOnLocalDate(roundDate, '2026-10-07')).toBe(true)
    expect(isRoundOnLocalDate(roundDate.toISOString(), '2026-10-07')).toBe(true)

    // 다른 날짜의 라운드는 false
    const anotherDate = new Date(2026, 9, 8, 10, 0, 0)
    expect(isRoundOnLocalDate(anotherDate, '2026-10-07')).toBe(false)
  })
})
