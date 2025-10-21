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
