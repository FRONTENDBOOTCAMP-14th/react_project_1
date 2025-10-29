/**
 * 날짜/시간 포맷팅 유틸리티
 * ISO 8601 형식의 날짜 문자열을 "YYYY년 MM월 DD일 HH:mm" 형식으로 변환
 *
 * @param dateInput - Date 객체 또는 ISO 날짜 문자열
 * @param includeTime - 시간 정보 포함 여부 (기본값: true)
 * @returns 포맷팅된 날짜 문자열
 *
 * @example
 * formatDate('2025-10-20T14:00:00.000Z') // "2025년 10월 20일 14:00"
 * formatDate(new Date(), false) // "2025년 10월 17일"
 */
export default function formatDate(
  dateInput: Date | string | null | undefined,
  includeTime: boolean = true
): string {
  if (!dateInput) {
    return ''
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

  // 유효하지 않은 날짜 체크
  if (isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  if (!includeTime) {
    return `${year}년 ${month}월 ${day}일`
  }

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`
}

/**
 * 날짜 범위를 포맷팅
 *
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @param includeTime - 시간 정보 포함 여부 (기본값: true)
 * @returns 포맷팅된 날짜 범위 문자열
 *
 * @example
 * formatDateRange('2025-10-20T14:00:00Z', '2025-10-20T18:00:00Z')
 * // "2025년 10월 20일 14:00 ~ 18:00"
 *
 * formatDateRange('2025-10-20', '2025-10-31', false)
 * // "2025년 10월 20일 ~ 10월 31일"
 */
export function formatDateRange(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  includeTime: boolean = true
): string {
  if (!startDate && !endDate) {
    return ''
  }

  if (!startDate) {
    return `~ ${formatDate(endDate, includeTime)}`
  }

  if (!endDate) {
    return `${formatDate(startDate, includeTime)} ~`
  }

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  // 같은 날짜인지 확인
  const isSameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  if (isSameDay && includeTime) {
    const year = start.getFullYear()
    const month = start.getMonth() + 1
    const day = start.getDate()
    const startTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
    const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`

    return `${year}년 ${month}월 ${day}일 ${startTime} ~ ${endTime}`
  }

  return `${formatDate(startDate, includeTime)} ~ ${formatDate(endDate, includeTime)}`
}

/**
 * 주어진 날짜가 현재 시각으로부터 얼마나 지났는지 상대 시간으로 포맷팅합니다.
 * - "방금 전", "N초 전", "N분 전", "N시간 전", "N일 전" 형식으로 반환합니다.
 *
 * @param dateInput - Date 객체 또는 ISO 날짜 문자열 (null/undefined 허용)
 * @returns 상대 시간 문자열. 입력이 없거나 유효하지 않으면 빈 문자열 반환
 *
 * @example
 * formatDiffFromNow(new Date()) // "방금 전"
 * formatDiffFromNow('2025-10-20T14:00:00Z') // "N일 전"
 */
export function formatDiffFromNow(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return ''

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return ''

  const now = Date.now()
  const diffMs = now - date.getTime()

  if (diffMs < 0) return ''

  const seconds = Math.floor(diffMs / 1000)
  if (seconds === 0) return '방금 전'
  if (seconds < 60) return `${seconds}초 전`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}분 전`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`

  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

/**
 * UTC 기준으로 날짜를 포맷팅합니다.
 * 로컬 타임존 영향 없이 일관된 날짜 표시를 위해 사용합니다.
 *
 * @param dateInput - Date 객체 또는 ISO 날짜 문자열
 * @param includeTime - 시간 정보 포함 여부 (기본값: true)
 * @returns 포맷팅된 날짜 문자열
 *
 * @example
 * formatDateUTC('2025-10-20T05:00:00.000Z') // "2025년 10월 20일 05:00" (UTC 기준)
 * formatDateUTC(new Date(), false) // "2025년 10월 20일"
 */
export function formatDateUTC(
  dateInput: Date | string | null | undefined,
  includeTime: boolean = true
): string {
  if (!dateInput) {
    return ''
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

  // 유효하지 않은 날짜 체크
  if (isNaN(date.getTime())) {
    return ''
  }

  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()

  if (!includeTime) {
    return `${year}년 ${month}월 ${day}일`
  }

  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`
}

/**
 * UTC 기준으로 날짜 범위를 포맷팅합니다.
 *
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @param includeTime - 시간 정보 포함 여부 (기본값: true)
 * @returns 포맷팅된 날짜 범위 문자열
 *
 * @example
 * formatDateRangeUTC('2025-10-20T05:00:00Z', '2025-10-20T09:00:00Z')
 * // "2025년 10월 20일 05:00 ~ 09:00"
 */
export function formatDateRangeUTC(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  includeTime: boolean = true
): string {
  if (!startDate && !endDate) {
    return ''
  }

  if (!startDate) {
    return `~ ${formatDateUTC(endDate, includeTime)}`
  }

  if (!endDate) {
    return `${formatDateUTC(startDate, includeTime)} ~`
  }

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  // UTC 기준으로 같은 날짜인지 확인
  const isSameDay =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate()

  if (isSameDay && includeTime) {
    const year = start.getUTCFullYear()
    const month = start.getUTCMonth() + 1
    const day = start.getUTCDate()
    const startTime = `${String(start.getUTCHours()).padStart(2, '0')}:${String(start.getUTCMinutes()).padStart(2, '0')}`
    const endTime = `${String(end.getUTCHours()).padStart(2, '0')}:${String(end.getUTCMinutes()).padStart(2, '0')}`

    return `${year}년 ${month}월 ${day}일 ${startTime} ~ ${endTime}`
  }

  return `${formatDateUTC(startDate, includeTime)} ~ ${formatDateUTC(endDate, includeTime)}`
}
