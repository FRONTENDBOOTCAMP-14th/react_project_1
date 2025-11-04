/**
 * 타임존 유틸리티
 * 사용자의 타임존을 감지하고 변환합니다.
 */

import { useEffect, useState } from 'react'

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
  return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000)
}

/**
 * 로컬 시간을 UTC로 변환합니다.
 */
export function toUTCTime(localDate: Date | string): Date {
  const date = typeof localDate === 'string' ? new Date(localDate) : localDate
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
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
 * 타임존 오프셋을 계산합니다.
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): number {
  const utcDate = new Date(date.toISOString())
  const timezoneDate = toTimezone(utcDate, timezone)
  return (timezoneDate.getTime() - utcDate.getTime()) / (1000 * 60) // 분 단위
}

/**
 * 타임존 정보를 포맷팅하여 표시합니다.
 */
export function formatTimezoneInfo(info: TimezoneInfo): string {
  const dstIndicator = info.isDST ? ' (DST)' : ''
  return `${info.name} ${info.offsetString}${dstIndicator}`
}

/**
 * React Hook for timezone
 */
export function useTimezone() {
  const [timezoneInfo, setTimezoneInfo] = useState<TimezoneInfo>(getTimezoneInfo())

  useEffect(() => {
    // 타임존 변경 감지 (거의 발생하지 않지만 안전하게)
    const checkTimezone = () => {
      const newInfo = getTimezoneInfo()
      if (newInfo.timezone !== timezoneInfo.timezone || newInfo.offset !== timezoneInfo.offset) {
        setTimezoneInfo(newInfo)
      }
    }

    const interval = setInterval(checkTimezone, 60000) // 1분마다 확인

    return () => clearInterval(interval)
  }, [timezoneInfo])

  return {
    timezoneInfo,
    toLocalTime,
    toUTCTime,
    toTimezone,
    formatTimezoneInfo: () => formatTimezoneInfo(timezoneInfo),
  }
}

/**
 * 타임존 목록을 반환합니다. (선택용)
 */
export function getCommonTimezones(): Array<{ value: string; label: string; offset: string }> {
  const timezones = [
    { value: 'Asia/Seoul', label: '대한민국', offset: 'GMT+09:00' },
    { value: 'Asia/Tokyo', label: '일본', offset: 'GMT+09:00' },
    { value: 'Asia/Shanghai', label: '중국', offset: 'GMT+08:00' },
    { value: 'Asia/Singapore', label: '싱가포르', offset: 'GMT+08:00' },
    { value: 'America/New_York', label: '미국 동부', offset: 'GMT-05:00' },
    { value: 'America/Los_Angeles', label: '미국 태평양', offset: 'GMT-08:00' },
    { value: 'America/Chicago', label: '미국 중부', offset: 'GMT-06:00' },
    { value: 'Europe/London', label: '영국', offset: 'GMT+00:00' },
    { value: 'Europe/Paris', label: '프랑스', offset: 'GMT+01:00' },
    { value: 'Europe/Berlin', label: '독일', offset: 'GMT+01:00' },
    { value: 'Australia/Sydney', label: '호주', offset: 'GMT+11:00' },
  ]

  return timezones
}
