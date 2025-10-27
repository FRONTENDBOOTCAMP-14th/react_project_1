/**
 * URL 경로 문자열을 디코딩하고 첫 글자를 대문자로 변환
 * @param str - 변환할 문자열
 * @returns 디코딩 및 대문자 변환된 문자열
 * @example
 * decodeAndCapitalize('my-project') // 'my project'
 * decodeAndCapitalize('hello%20world') // 'Hello world'
 */
export function decodeAndCapitalize(str: string): string {
  try {
    const decoded = decodeURIComponent(str.replace(/-/g, ' '))
    // 기본 Latin 문자의 첫 번째 알파벳을 대문자로 변경
    return decoded.replace(/^[a-z]/, m => m.toUpperCase())
  } catch {
    return str
  }
}

/**
 * 경로의 마지막 세그먼트가 UUID인지 확인
 * @param segment - 확인할 경로 세그먼트
 * @returns UUID 여부
 */
export function isUUID(segment: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidPattern.test(segment)
}

/**
 * 경로의 마지막 세그먼트가 숫자 ID인지 확인
 * @param segment - 확인할 경로 세그먼트
 * @returns 숫자 ID 여부
 */
export function isNumericId(segment: string): boolean {
  return /^\d+$/.test(segment)
}
