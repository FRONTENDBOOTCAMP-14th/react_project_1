/**
 * 데이터 변환 및 처리 유틸리티
 * 필터링, 정렬, 그룹핑, 페이지네이션 등
 */

/**
 * 목표 상태별 필터링
 */
export function filterGoalsByStatus<T extends { isComplete: boolean }>(
  goals: T[],
  status: 'all' | 'completed' | 'incomplete'
): T[] {
  switch (status) {
    case 'completed':
      return goals.filter(goal => goal.isComplete)
    case 'incomplete':
      return goals.filter(goal => !goal.isComplete)
    default:
      return goals
  }
}

/**
 * 날짜 범위별 필터링
 */
export function filterByDateRange<T extends { createdAt: Date | string }>(
  items: T[],
  startDate?: Date | string,
  endDate?: Date | string
): T[] {
  if (!startDate && !endDate) return items

  return items.filter(item => {
    const itemDate = new Date(item.createdAt)

    if (startDate && itemDate < new Date(startDate)) return false
    if (endDate && itemDate > new Date(endDate)) return false

    return true
  })
}

/**
 * 텍스트 검색 필터링
 */
export function filterBySearchText<T extends Record<string, unknown>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return items

  const term = searchTerm.toLowerCase()

  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(term)
      }
      if (typeof value === 'number') {
        return value.toString().includes(term)
      }
      return false
    })
  )
}

/**
 * 커뮤니티 멤버 필터링
 */
export function filterMembersByRole<T extends { role: string }>(members: T[], role?: string): T[] {
  if (!role) return members
  return members.filter(member => member.role === role)
}

/**
 * 라운드별 목표 필터링
 */
export function filterGoalsByRound<T extends { roundId?: string | null }>(
  goals: T[],
  roundId?: string | null
): T[] {
  if (!roundId) return goals
  return goals.filter(goal => goal.roundId === roundId)
}

/**
 * 날짜별 정렬
 */
export function sortByDate<T extends { createdAt: Date | string }>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}

/**
 * 진행률별 정렬
 */
export function sortByProgress<T extends { completed: number; total: number }>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const progressA = a.total > 0 ? (a.completed / a.total) * 100 : 0
    const progressB = b.total > 0 ? (b.completed / b.total) * 100 : 0
    return order === 'asc' ? progressA - progressB : progressB - progressA
  })
}

/**
 * 이름별 정렬
 */
export function sortByName<T extends { name: string } | { title: string } | { username: string }>(
  items: T[],
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const nameA = 'name' in a ? a.name : 'title' in a ? a.title : a.username
    const nameB = 'name' in b ? b.name : 'title' in b ? b.title : b.username

    const comparison = nameA.localeCompare(nameB)
    return order === 'asc' ? comparison : -comparison
  })
}

/**
 * 상태별 그룹핑
 */
export function groupByStatus<T extends { isComplete: boolean }>(
  goals: T[]
): { completed: T[]; incomplete: T[] } {
  return goals.reduce(
    (groups, goal) => {
      if (goal.isComplete) {
        groups.completed.push(goal)
      } else {
        groups.incomplete.push(goal)
      }
      return groups
    },
    { completed: [] as T[], incomplete: [] as T[] }
  )
}

/**
 * 라운드별 그룹핑
 */
export function groupByRound<T extends { roundId?: string | null; roundNumber?: number }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce(
    (groups, item) => {
      const roundKey = item.roundId || 'unassigned'
      if (!groups[roundKey]) {
        groups[roundKey] = []
      }
      groups[roundKey].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

/**
 * 날짜별 그룹핑 (년-월)
 */
export function groupByMonth<T extends { createdAt: Date | string }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce(
    (groups, item) => {
      const date = new Date(item.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

/**
 * 페이지네이션
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; totalPages: number; currentPage: number; totalItems: number } {
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const currentPage = Math.max(1, Math.min(page, totalPages))

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    items: items.slice(startIndex, endIndex),
    totalPages,
    currentPage,
    totalItems,
  }
}

/**
 * 중복 제거
 */
export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

/**
 * 중복 제거 (객체 키 기준)
 */
export function uniqueBy<T, K extends keyof T>(items: T[], key: K): T[] {
  const seen = new Set<T[K]>()
  return items.filter(item => {
    if (seen.has(item[key])) {
      return false
    }
    seen.add(item[key])
    return true
  })
}

/**
 * 목표 통계 변환
 */
export function transformGoalStats(goals: { isComplete: boolean; createdAt: Date | string }[]) {
  const total = goals.length
  const completed = goals.filter(goal => goal.isComplete).length
  const completionRate = total > 0 ? (completed / total) * 100 : 0

  const thisMonth = new Date().getMonth()
  const thisMonthGoals = goals.filter(goal => new Date(goal.createdAt).getMonth() === thisMonth)
  const thisMonthCompleted = thisMonthGoals.filter(goal => goal.isComplete).length

  return {
    total,
    completed,
    completionRate: Math.round(completionRate),
    thisMonth: {
      total: thisMonthGoals.length,
      completed: thisMonthCompleted,
      completionRate:
        thisMonthGoals.length > 0
          ? Math.round((thisMonthCompleted / thisMonthGoals.length) * 100)
          : 0,
    },
  }
}

/**
 * 커뮤니티 멤버 통계 변환
 */
export function transformMemberStats(members: { role: string; joinedAt: Date | string }[]) {
  const total = members.length

  const roleStats = members.reduce(
    (stats, member) => {
      stats[member.role] = (stats[member.role] || 0) + 1
      return stats
    },
    {} as Record<string, number>
  )

  const recentMembers = members.filter(member => {
    const joinedDate = new Date(member.joinedAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return joinedDate >= weekAgo
  })

  return {
    total,
    roleStats,
    recentMembers: recentMembers.length,
  }
}
