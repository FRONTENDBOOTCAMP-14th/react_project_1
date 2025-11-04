/**
 * 시간 관련 유틸리티
 * 상대시간, D-Day, 마감일 계산, 날짜 비교 등
 */

import formatDate from './formatDate'

/**
 * 상대시간 표시 (방금 전, 5분 전, 1시간 전 등)
 */
export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return '방금 전'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}일 전`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}주 전`
  }

  return targetDate.toLocaleDateString('ko-KR')
}

/**
 * D-Day 계산 (마감일까지 남은 일수)
 */
export function getDday(targetDate: Date | string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 마감 알림이 필요한지 확인
 */

/**
 * 오늘인지 확인
 */
export function isToday(date: Date | string): boolean {
  const today = new Date()
  const target = new Date(date)

  // UTC 시간을 로컬 시간으로 변환하여 비교
  const localTarget = new Date(target.getTime() + target.getTimezoneOffset() * 60000)

  return (
    today.getFullYear() === localTarget.getFullYear() &&
    today.getMonth() === localTarget.getMonth() &&
    today.getDate() === localTarget.getDate()
  )
}

/**
 * 이번 주인지 확인
 */
export function isThisWeek(date: Date | string): boolean {
  const today = new Date()
  const target = new Date(date)

  // UTC 시간을 로컬 시간으로 변환
  const localTarget = new Date(target.getTime() + target.getTimezoneOffset() * 60000)

  // 이번 주 시작일 (일요일)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  // 이번 주 종료일 (토요일)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return localTarget >= startOfWeek && localTarget <= endOfWeek
}

/**
 * 이번 달인지 확인
 */
export function isThisMonth(date: Date | string): boolean {
  const today = new Date()
  const target = new Date(date)

  return today.getFullYear() === target.getFullYear() && today.getMonth() === target.getMonth()
}

/**
 * 두 날짜 사이의 일수 차이
 */
export function getDaysDifference(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // UTC 시간을 로컬 시간으로 변환
  const localStart = new Date(start.getTime() + start.getTimezoneOffset() * 60000)
  const localEnd = new Date(end.getTime() + end.getTimezoneOffset() * 60000)

  localStart.setHours(0, 0, 0, 0)
  localEnd.setHours(0, 0, 0, 0)

  const diffTime = localEnd.getTime() - localStart.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 스터디 라운드 기간 포맷팅
 */
export function formatRoundPeriod(startDate: Date | string, endDate: Date | string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const daysDiff = getDaysDifference(start, end)

  if (daysDiff <= 1) {
    return formatDate(start, false)
  }

  return `${formatDate(start, false)} ~ ${formatDate(end, false)} (${daysDiff}일)`
}

/**
 * 시간 포맷팅 (HH:mm)
 */
export function formatTime(date: Date | string): string {
  const targetDate = new Date(date)
  // UTC 시간을 로컬 시간으로 변환
  const localDate = new Date(targetDate.getTime() + targetDate.getTimezoneOffset() * 60000)
  const hours = String(localDate.getHours()).padStart(2, '0')
  const minutes = String(localDate.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
