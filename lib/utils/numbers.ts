/**
 * 수치 및 통계 유틸리티
 * 퍼센트 계산, 진행률, 통계 등 숫자 관련 처리
 */

/**
 * 백분율 계산
 * @param current 현재 값
 * @param total 전체 값
 * @returns 백분율 (0-100)
 */
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

/**
 * 진행률 계산 (소수점 첫째자리까지)
 * @param completed 완료된 항목 수
 * @param total 전체 항목 수
 * @returns 진행률 (0-100)
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 1000) / 10 // 소수점 첫째자리
}

/**
 * 팀 목표 진행률 계산
 * @param memberGoals 팀원별 목표들
 * @returns 팀 전체 진행률
 */
export function calculateTeamProgress(memberGoals: { completed: number; total: number }[]): number {
  if (memberGoals.length === 0) return 0

  const totalCompleted = memberGoals.reduce((sum, goal) => sum + goal.completed, 0)
  const totalOverall = memberGoals.reduce((sum, goal) => sum + goal.total, 0)

  return calculateProgress(totalCompleted, totalOverall)
}

/**
 * 라운드별 목표 달성률
 * @param roundGoals 라운드 내 목표들
 * @returns 달성률
 */
export function calculateRoundAchievement(
  roundGoals: { completed: number; total: number }[]
): number {
  return calculateTeamProgress(roundGoals)
}

/**
 * 범위 제한 (min-max)
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 백분율을 0-100 범위로 제한
 */
export function clampPercentage(percentage: number): number {
  return clamp(percentage, 0, 100)
}

/**
 * 소수점 반올림
 */
export function roundToDecimal(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * 통계 계산 - 평균
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  return roundToDecimal(sum / numbers.length, 1)
}

/**
 * 통계 계산 - 최대값
 */
export function calculateMax(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return Math.max(...numbers)
}

/**
 * 통계 계산 - 최소값
 */
export function calculateMin(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return Math.min(...numbers)
}

/**
 * 진행률 상태별 메시지
 */
export function getProgressStatus(percentage: number): '초기' | '진행중' | '완료' | '초과' {
  if (percentage >= 100) return '완료'
  if (percentage >= 80) return '진행중'
  if (percentage > 0) return '초기'
  return '초기'
}

/**
 * 달성률 등급 (A, B, C, D, F)
 */
export function getAchievementGrade(percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  const clamped = clampPercentage(percentage)
  if (clamped >= 90) return 'A'
  if (clamped >= 80) return 'B'
  if (clamped >= 70) return 'C'
  if (clamped >= 60) return 'D'
  return 'F'
}

/**
 * 숫자를 한글로 변환 (1 -> '첫', 2 -> '두')
 */
export function numberToKorean(num: number): string {
  const koreanNumbers = ['영', '첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉']
  return koreanNumbers[num] || num.toString()
}
