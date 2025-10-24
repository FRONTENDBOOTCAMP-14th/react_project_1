/**
 * 색상 관련 유틸리티
 * 상태별 색상, 등급별 색상, 차트 색상, 테마 색상
 */

/**
 * 진행률 상태별 색상
 */
export function getProgressColor(percentage: number): string {
  const clamped = Math.max(0, Math.min(100, percentage))

  if (clamped >= 100) return 'var(--success-color)' // green
  if (clamped >= 80) return 'var(--info-color)' // blue
  if (clamped >= 60) return 'var(--warning-color)' // amber
  if (clamped >= 40) return 'var(--color-orange)' // orange
  if (clamped >= 20) return 'var(--error-color)' // red
  return 'var(--color-gray)' // gray
}

/**
 * 목표 상태별 색상
 */
export function getGoalStatusColor(status: '초기' | '진행중' | '완료' | '초과'): string {
  switch (status) {
    case '완료':
      return 'var(--success-color)' // green
    case '진행중':
      return 'var(--info-color)' // blue
    case '초기':
      return 'var(--color-gray)' // gray
    case '초과':
      return 'var(--error-color)' // red
    default:
      return 'var(--color-gray)'
  }
}

/**
 * 마감일 상태별 색상
 */
export function getDeadlineColor(status: '임박' | '마감' | '초과' | '여유'): string {
  switch (status) {
    case '여유':
      return 'var(--success-color)' // green
    case '임박':
      return 'var(--warning-color)' // amber
    case '마감':
      return 'var(--error-color)' // red
    case '초과':
      return 'var(--color-gray)' // gray
    default:
      return 'var(--color-gray)'
  }
}

/**
 * 멤버 역할별 색상
 */
export function getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'var(--info-color)' // blue
    default:
      return 'var(--color-gray)'
  }
}

/**
 * 라운드별 색상 (최대 10개 라운드)
 */
export function getRoundColor(roundNumber: number): string {
  const colors = [
    'var(--color-red)', // red
    'var(--color-orange)', // orange
    'var(--warning-color)', // amber
    'var(--color-yellow)', // yellow
    'var(--success-color)', // green
    'var(--color-cyan)', // cyan
    'var(--info-color)', // blue
    'var(--color-violet)', // violet
    'var(--color-pink)', // pink
    'var(--color-gray)', // gray
  ]

  return colors[(roundNumber - 1) % colors.length]
}

/**
 * 차트 색상 팔레트
 */
export const chartColors = {
  primary: [
    'var(--info-color)', // blue
    'var(--success-color)', // green
    'var(--warning-color)', // amber
    'var(--error-color)', // red
    'var(--color-violet)', // violet
    'var(--color-cyan)', // cyan
    'var(--color-pink)', // pink
    'var(--color-lime)', // lime
  ],
  secondary: [
    'var(--color-blue-light)', // blue light
    'var(--color-green-light)', // green light
    'var(--color-amber-light)', // amber light
    'var(--color-red-light)', // red light
    'var(--color-violet-light)', // violet light
    'var(--color-cyan-light)', // cyan light
    'var(--color-pink-light)', // pink light
    'var(--color-lime-light)', // lime light
  ],
}

/**
 * 진행률 바 색상 (CSS 변수 형태)
 */
export function getProgressBarColor(percentage: number): {
  backgroundColor: string
  color: string
} {
  const clamped = Math.max(0, Math.min(100, percentage))

  if (clamped >= 80) {
    return { backgroundColor: 'var(--success-color)', color: 'var(--primary-color)' }
  } else if (clamped >= 60) {
    return { backgroundColor: 'var(--info-color)', color: 'var(--primary-color)' }
  } else if (clamped >= 40) {
    return { backgroundColor: 'var(--warning-color)', color: 'var(--primary-color)' }
  } else if (clamped >= 20) {
    return { backgroundColor: 'var(--color-orange)', color: 'var(--primary-color)' }
  }

  return { backgroundColor: 'var(--error-color)', color: 'var(--primary-color)' }
}

/**
 * 텍스트 색상 (배경에 따른 대비)
 */
export function getContrastTextColor(backgroundColor: string): string {
  // 간단한 휴리스틱: 어두운 배경에는 흰색, 밝은 배경에는 검은색
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  return brightness > 128 ? 'var(--secondary-color)' : 'var(--primary-color)'
}

/**
 * 색상 밝기 조절
 */
export function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}

/**
 * 색상 어둡게 조절
 */
export function darkenColor(color: string, percent: number): string {
  return lightenColor(color, -percent)
}

/**
 * 반응(이모지)별 색상
 */
export function getReactionColor(emoji: string): string {
  const emojiColors: Record<string, string> = {
    '👍': 'var(--success-color)', // green
    '❤️': 'var(--error-color)', // red
    '😂': 'var(--warning-color)', // amber
    '😮': 'var(--info-color)', // blue
    '😢': 'var(--color-violet)', // violet
    '🔥': 'var(--color-orange)', // orange
    '🎉': 'var(--color-pink)', // pink
  }

  return emojiColors[emoji] || 'var(--color-gray)'
}

/**
 * 알림 타입별 색상
 */
export function getNotificationColor(type: 'info' | 'success' | 'warning' | 'error'): string {
  switch (type) {
    case 'info':
      return 'var(--info-color)' // blue
    case 'success':
      return 'var(--success-color)' // green
    case 'warning':
      return 'var(--warning-color)' // amber
    case 'error':
      return 'var(--error-color)' // red
    default:
      return 'var(--color-gray)'
  }
}
