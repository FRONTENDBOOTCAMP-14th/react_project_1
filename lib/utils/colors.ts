/**
 * 색상 관련 유틸리티
 * 상태별 색상, 등급별 색상, 차트 색상, 테마 색상
 */

/**
 * 진행률 상태별 색상
 */
export function getProgressColor(percentage: number): string {
  const clamped = Math.max(0, Math.min(100, percentage))

  if (clamped >= 100) return '#22c55e' // green-500
  if (clamped >= 80) return '#3b82f6' // blue-500
  if (clamped >= 60) return '#f59e0b' // amber-500
  if (clamped >= 40) return '#f97316' // orange-500
  if (clamped >= 20) return '#ef4444' // red-500
  return '#6b7280' // gray-500
}

/**
 * 등급별 색상 (A, B, C, D, F)
 */
export function getGradeColor(grade: 'A' | 'B' | 'C' | 'D' | 'F'): string {
  switch (grade) {
    case 'A':
      return '#22c55e' // green-500
    case 'B':
      return '#3b82f6' // blue-500
    case 'C':
      return '#f59e0b' // amber-500
    case 'D':
      return '#f97316' // orange-500
    case 'F':
      return '#ef4444' // red-500
    default:
      return '#6b7280' // gray-500
  }
}

/**
 * 목표 상태별 색상
 */
export function getGoalStatusColor(status: '초기' | '진행중' | '완료' | '초과'): string {
  switch (status) {
    case '완료':
      return '#22c55e' // green-500
    case '진행중':
      return '#3b82f6' // blue-500
    case '초기':
      return '#6b7280' // gray-500
    case '초과':
      return '#ef4444' // red-500
    default:
      return '#6b7280'
  }
}

/**
 * 마감일 상태별 색상
 */
export function getDeadlineColor(status: '임박' | '마감' | '초과' | '여유'): string {
  switch (status) {
    case '여유':
      return '#22c55e' // green-500
    case '임박':
      return '#f59e0b' // amber-500
    case '마감':
      return '#ef4444' // red-500
    case '초과':
      return '#6b7280' // gray-500
    default:
      return '#6b7280'
  }
}

/**
 * 멤버 역할별 색상
 */
export function getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin':
    case 'owner':
      return '#7c3aed' // violet-500
    case 'moderator':
    case 'manager':
      return '#3b82f6' // blue-500
    case 'member':
      return '#6b7280' // gray-500
    case 'guest':
      return '#9ca3af' // gray-400
    default:
      return '#6b7280'
  }
}

/**
 * 라운드별 색상 (최대 10개 라운드)
 */
export function getRoundColor(roundNumber: number): string {
  const colors = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#eab308', // yellow-500
    '#22c55e', // green-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#6b7280', // gray-500
  ]

  return colors[(roundNumber - 1) % colors.length]
}

/**
 * 차트 색상 팔레트
 */
export const chartColors = {
  primary: [
    '#3b82f6', // blue-500
    '#22c55e', // green-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
    '#84cc16', // lime-500
  ],
  secondary: [
    '#60a5fa', // blue-400
    '#4ade80', // green-400
    '#fbbf24', // amber-400
    '#f87171', // red-400
    '#a78bfa', // violet-400
    '#22d3ee', // cyan-400
    '#f472b6', // pink-400
    '#a3e635', // lime-400
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
    return { backgroundColor: '#22c55e', color: '#ffffff' }
  } else if (clamped >= 60) {
    return { backgroundColor: '#3b82f6', color: '#ffffff' }
  } else if (clamped >= 40) {
    return { backgroundColor: '#f59e0b', color: '#ffffff' }
  } else if (clamped >= 20) {
    return { backgroundColor: '#f97316', color: '#ffffff' }
  }

  return { backgroundColor: '#ef4444', color: '#ffffff' }
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

  return brightness > 128 ? '#000000' : '#ffffff'
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
    '👍': '#22c55e', // green
    '❤️': '#ef4444', // red
    '😂': '#f59e0b', // amber
    '😮': '#3b82f6', // blue
    '😢': '#8b5cf6', // violet
    '🔥': '#f97316', // orange
    '🎉': '#ec4899', // pink
  }

  return emojiColors[emoji] || '#6b7280'
}

/**
 * 알림 타입별 색상
 */
export function getNotificationColor(type: 'info' | 'success' | 'warning' | 'error'): string {
  switch (type) {
    case 'info':
      return '#3b82f6' // blue-500
    case 'success':
      return '#22c55e' // green-500
    case 'warning':
      return '#f59e0b' // amber-500
    case 'error':
      return '#ef4444' // red-500
    default:
      return '#6b7280'
  }
}
