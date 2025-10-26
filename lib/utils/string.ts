/**
 * 문자열 처리 유틸리티
 * 텍스트 자르기, 이모지, 검색, 태그 처리 등
 */

/**
 * 텍스트를 지정한 길이로 자르고 말줄임표 추가
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

/**
 * 제목용 텍스트 자르기 (더 짧게)
 */
export function truncateTitle(title: string, maxLength: number = 30): string {
  return truncateText(title, maxLength)
}

/**
 * 설명용 텍스트 자르기 (더 길게)
 */
export function truncateDescription(description: string, maxLength: number = 150): string {
  return truncateText(description, maxLength)
}

/**
 * 이모지 추출
 */
export function extractEmojis(text: string): string[] {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  return text.match(emojiRegex) || []
}

/**
 * 텍스트에서 이모지 제거
 */
export function removeEmojis(text: string): string {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  return text.replace(emojiRegex, '').trim()
}

/**
 * 이모지인지 확인
 */
export function isEmoji(char: string): boolean {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  return emojiRegex.test(char)
}

/**
 * 검색어 하이라이트
 */
export function highlightSearchText(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * 대소문자 구분 없이 검색
 */
export function searchText(text: string, searchTerm: string): boolean {
  return text.toLowerCase().includes(searchTerm.toLowerCase())
}

/**
 * 여러 검색어로 필터링 (AND 조건)
 */
export function filterBySearchTerms(text: string, searchTerms: string[]): boolean {
  return searchTerms.every(term => searchText(text, term))
}

/**
 * 태그 문자열을 배열로 변환
 */
export function parseTags(tagString: string): string[] {
  return tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
}

/**
 * 태그 배열을 문자열로 변환
 */
export function stringifyTags(tags: string[]): string {
  return tags.join(', ')
}

/**
 * HTML 이스케이프
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return text.replace(/[&<>"']/g, char => htmlEscapes[char])
}

/**
 * HTML 언이스케이프
 */
export function unescapeHtml(text: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  }

  return text.replace(/&(amp|lt|gt|quot|#39);/g, entity => htmlUnescapes[entity])
}

/**
 * 첫 글자 대문자 변환
 */
export function capitalizeFirst(text: string): string {
  if (text.length === 0) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * 낙타표기법 변환
 */
export function toCamelCase(text: string): string {
  return text.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
}

/**
 * 케밥표기법 변환
 */
export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * 공백으로 구분된 단어 수 세기
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length
}

/**
 * URL에서 제목 추출 (커뮤니티명, 목표 제목 등)
 */
export function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const segments = pathname.split('/').filter(Boolean)

    if (segments.length > 0) {
      return decodeURIComponent(segments[segments.length - 1].replace(/-/g, ' '))
    }

    return urlObj.hostname
  } catch {
    return url
  }
}
