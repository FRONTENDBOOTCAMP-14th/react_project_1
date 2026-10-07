/**
 * 타임존 유틸리티
 * 사용자의 타임존을 감지하고 변환합니다.
 */

export interface TimezoneInfo {
  timezone: string
  offset: number // GMT 오프셋 (분)
  offsetString: string // "GMT+09:00" 형식
  isDST: boolean // 서머타임 여부
  name: string // "대한민국 표준시" 같은 표시 이름
}

/**
 * 현재 사용자의 타임존 정보를 반환합니다.
 */
export function getTimezoneInfo(): TimezoneInfo {
  const date = new Date()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // GMT 오프셋 계산 (분)
  const offset = -date.getTimezoneOffset()

  // GMT 오프셋 문자열 생성
  const offsetHours = Math.floor(Math.abs(offset) / 60)
  const offsetMinutes = Math.abs(offset) % 60
  const sign = offset >= 0 ? '+' : '-'
  const offsetString = `GMT${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`

  // 서머타임 확인
  const isDST = isDaylightSavingTime(date)

  // 표시 이름 생성
  const name = getTimezoneDisplayName(timezone, offsetString)

  return {
    timezone,
    offset,
    offsetString,
    isDST,
    name,
  }
}

/**
 * 서머타임인지 확인합니다.
 */
function isDaylightSavingTime(date: Date): boolean {
  const january = new Date(date.getFullYear(), 0, 1)
  const july = new Date(date.getFullYear(), 6, 1)

  const janOffset = january.getTimezoneOffset()
  const julOffset = july.getTimezoneOffset()
  const currentOffset = date.getTimezoneOffset()

  return Math.max(janOffset, julOffset) !== currentOffset
}

/**
 * 타임존 표시 이름을 반환합니다.
 */
function getTimezoneDisplayName(timezone: string, offsetString: string): string {
  const timezoneNames: Record<string, string> = {
    'Asia/Seoul': '대한민국 표준시',
    'Asia/Tokyo': '일본 표준시',
    'Asia/Shanghai': '중국 표준시',
    'Asia/Hong_Kong': '홍콩 표준시',
    'Asia/Singapore': '싱가포르 표준시',
    'America/New_York': '미국 동부 표준시',
    'America/Los_Angeles': '미국 태평양 표준시',
    'America/Chicago': '미국 중부 표준시',
    'Europe/London': '영국 표준시',
    'Europe/Paris': '프랑스 표준시',
    'Europe/Berlin': '독일 표준시',
    'Australia/Sydney': '호주 동부 표준시',
  }

  return timezoneNames[timezone] || `${timezone} (${offsetString})`
}

/**
 * UTC 시간을 사용자의 로컬 타임존으로 변환합니다.
 */
export function toLocalTime(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
}

/**
 * 로컬 시간을 UTC로 변환합니다.
 */
export function toUTCTime(localDate: Date | string): Date {
  const date = typeof localDate === 'string' ? new Date(localDate) : localDate
  return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000)
}

/**
 * 날짜를 특정 타임존으로 변환합니다.
 */
export function toTimezone(date: Date, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0')
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1')
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0')
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0')
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0')

  return new Date(year, month, day, hour, minute, second)
}

/**
 * 타임존 정보를 포맷팅하여 표시합니다.
 */
export function formatTimezoneInfo(info: TimezoneInfo): string {
  const dstIndicator = info.isDST ? ' (DST)' : ''
  return `${info.name} ${info.offsetString}${dstIndicator}`
}

/**
 * 주어진 YYYY-MM-DD 날짜의 클라이언트 로컬 기준 하루 범위 (00:00:00.000 ~ 23:59:59.999)를 반환합니다.
 */
export function getLocalDateRange(dateKey: string): { start: Date; end: Date } {
  const [yearStr, monthStr, dayStr] = dateKey.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) - 1
  const day = parseInt(dayStr, 10)

  const start = new Date(year, month, day, 0, 0, 0, 0)
  const end = new Date(year, month, day, 23, 59, 59, 999)
  return { start, end }
}

/**
 * 라운드 시작 일시가 특정 YYYY-MM-DD(로컬 기준) 날짜에 속하는지 판별합니다.
 */
export function isRoundOnLocalDate(roundStartDate: Date | string, dateKey: string): boolean {
  const { start, end } = getLocalDateRange(dateKey)
  const date = typeof roundStartDate === 'string' ? new Date(roundStartDate) : roundStartDate
  return date >= start && date <= end
}
