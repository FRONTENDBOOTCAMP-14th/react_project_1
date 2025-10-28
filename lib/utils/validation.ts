/**
 * 데이터 검증 유틸리티
 * 사용자 입력값, 이메일, 닉네임, 날짜 등 검증 로직
 */

/**
 * 이메일 주소 유효성 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 닉네임 유효성 검증
 * - 2~20자
 * - 한글, 영문, 숫자, 공백, _ 만 허용
 */
export function isValidNickname(nickname: string): boolean {
  const nicknameRegex = /^[가-힣a-zA-Z0-9\s_]{2,20}$/
  return nicknameRegex.test(nickname)
}

/**
 * 문자열 길이 검증
 */
export function isValidLength(text: string, options: { min?: number; max?: number } = {}): boolean {
  const { min = 0, max = Infinity } = options
  return text.length >= min && text.length <= max
}

/**
 * 목표 제목 유효성 검증 (1~100자)
 */
export function isValidGoalTitle(title: string): boolean {
  return isValidLength(title, { min: 1, max: 100 })
}

/**
 * 목표 설명 유효성 검증 (0~1000자)
 */
export function isValidGoalDescription(description: string): boolean {
  return isValidLength(description, { min: 0, max: 1000 })
}

/**
 * 날짜 범위 유효성 검증
 */
export function isValidDateRange(startDate: Date | string, endDate: Date | string): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false
  }

  return start <= end
}

/**
 * 미래 날짜인지 확인
 */
export function isFutureDate(date: Date | string): boolean {
  const targetDate = new Date(date)
  const now = new Date()
  return targetDate > now
}

/**
 * URL 유효성 검증
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 비밀번호 유효성 검증 (8~50자, 대소문자+숫자+특수문자)
 */
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/
  return passwordRegex.test(password)
}

/**
 * 사용자명 유효성 검증 (3~30자, 영문/숫자/_ 만)
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  return usernameRegex.test(username)
}
