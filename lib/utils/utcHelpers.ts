/**
 * UTC 날짜/시간 처리 유틸리티
 * 서버와 클라이언트 간 일관된 UTC 기반 날짜 처리를 위한 헬퍼 함수들
 */

/**
 * 서버로부터 현재 UTC 시간을 가져옵니다.
 * 네트워크 실패 시 클라이언트 시간을 fallback으로 사용합니다.
 *
 * @returns Promise<Date> - 서버의 UTC 시간
 *
 * @example
 * const serverTime = await getServerTime()
 * console.log(serverTime.toISOString())
 */
export async function getServerTime(): Promise<Date> {
  try {
    const response = await fetch('/api/server-time')
    if (!response.ok) {
      throw new Error('Failed to fetch server time')
    }
    const data = await response.json()
    return new Date(data.serverTime)
  } catch (error) {
    console.warn('Failed to get server time, using client time as fallback:', error)
    return new Date()
  }
}

/**
 * 로컬 Date 객체를 UTC 기준 Date로 변환합니다.
 * 로컬 시간의 날짜/시간 숫자를 UTC로 해석합니다.
 *
 * @param date - 변환할 Date 객체
 * @returns UTC 기준 Date 객체
 *
 * @example
 * const local = new Date(2025, 9, 20, 14, 30) // 로컬 2025-10-20 14:30
 * const utc = toUTC(local) // UTC 2025-10-20 14:30
 */
export function toUTC(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  )
}

/**
 * UTC ISO string을 Date 객체로 파싱합니다.
 * (사실상 new Date()와 동일하지만 명시적 의도 표현)
 *
 * @param isoString - ISO 8601 형식의 UTC 문자열
 * @returns Date 객체
 *
 * @example
 * const date = fromUTC('2025-10-20T05:00:00.000Z')
 */
export function fromUTC(isoString: string): Date {
  return new Date(isoString)
}

/**
 * 주어진 Date의 UTC 기준 하루 범위(00:00:00 ~ 23:59:59.999)를 반환합니다.
 *
 * @param date - 기준 날짜
 * @returns { start: Date, end: Date } - 해당 날짜의 시작과 끝
 *
 * @example
 * const date = new Date('2025-10-20T14:30:00Z')
 * const { start, end } = getUTCDayRange(date)
 * // start: 2025-10-20T00:00:00.000Z
 * // end: 2025-10-20T23:59:59.999Z
 */
export function getUTCDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)
  )

  const end = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)
  )

  return { start, end }
}

/**
 * 주어진 Date의 UTC 기준 월 범위를 반환합니다.
 *
 * @param date - 기준 날짜
 * @returns { start: Date, end: Date } - 해당 월의 시작과 끝
 *
 * @example
 * const date = new Date('2025-10-20')
 * const { start, end } = getUTCMonthRange(date)
 * // start: 2025-10-01T00:00:00.000Z
 * // end: 2025-10-31T23:59:59.999Z
 */
export function getUTCMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0))

  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999))

  return { start, end }
}

/**
 * Date를 datetime-local input 형식으로 변환합니다.
 * UTC 시간을 그대로 "YYYY-MM-DDTHH:mm" 형식으로 반환합니다.
 *
 * @param dateInput - Date 객체 또는 ISO 날짜 문자열
 * @returns datetime-local input용 문자열
 *
 * @example
 * toDatetimeLocalString('2025-10-20T14:30:00.000Z')
 * // "2025-10-20T14:30"
 */
export function toDatetimeLocalString(dateInput: Date | string | null | undefined): string {
  if (!dateInput) {
    return ''
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

  if (isNaN(date.getTime())) {
    return ''
  }

  // UTC 기준으로 추출
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * datetime-local input 값을 UTC ISO string으로 변환합니다.
 *
 * @param datetimeLocalValue - "YYYY-MM-DDTHH:mm" 형식의 문자열
 * @returns ISO 8601 UTC 문자열
 *
 * @example
 * fromDatetimeLocalString('2025-10-20T14:30')
 * // "2025-10-20T14:30:00.000Z"
 */
export function fromDatetimeLocalString(datetimeLocalValue: string): string {
  if (!datetimeLocalValue) {
    return ''
  }

  // datetime-local 값을 UTC로 해석
  const date = new Date(datetimeLocalValue + ':00.000Z')
  return date.toISOString()
}

/**
 * 현재 UTC 날짜의 월을 반환합니다.
 *
 * @param serverTime - 서버 시간 (선택, 없으면 클라이언트 시간 사용)
 * @returns 0-11 사이의 월 인덱스
 */
export function getCurrentUTCMonth(serverTime?: Date): number {
  const date = serverTime || new Date()
  return date.getUTCMonth()
}

/**
 * 현재 UTC 날짜의 일(day)을 반환합니다.
 *
 * @param serverTime - 서버 시간 (선택, 없으면 클라이언트 시간 사용)
 * @returns 1-31 사이의 일
 */
export function getCurrentUTCDate(serverTime?: Date): number {
  const date = serverTime || new Date()
  return date.getUTCDate()
}

/**
 * 두 날짜가 UTC 기준으로 같은 날인지 확인합니다.
 *
 * @param date1 - 첫 번째 날짜
 * @param date2 - 두 번째 날짜
 * @returns 같은 날이면 true
 */
export function isSameUTCDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  )
}

/**
 * UTC 기준으로 날짜에 일수를 더합니다.
 *
 * @param date - 기준 날짜
 * @param days - 더할 일수 (음수 가능)
 * @returns 새로운 Date 객체
 *
 * @example
 * const today = new Date('2025-10-20T00:00:00Z')
 * const tomorrow = addUTCDays(today, 1)
 * const yesterday = addUTCDays(today, -1)
 */
export function addUTCDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

/**
 * UTC 기준으로 날짜에 월수를 더합니다.
 *
 * @param date - 기준 날짜
 * @param months - 더할 월수 (음수 가능)
 * @returns 새로운 Date 객체
 */
export function addUTCMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setUTCMonth(result.getUTCMonth() + months)
  return result
}

/**
 * ISO 8601 형식의 날짜 문자열이 유효한지 검증합니다.
 *
 * @param dateString - 검증할 날짜 문자열
 * @returns 유효하면 true
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}
