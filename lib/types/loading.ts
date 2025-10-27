/**
 * 로딩 관련 타입 정의
 */

/**
 * 스켈레톤 아이템 기본 타입
 */
export interface BaseSkeletonItem {
  id: string
  isSkeleton: true
}

/**
 * 스켈레톤 목표 타입
 */
export interface SkeletonGoal extends BaseSkeletonItem {
  title: string
  description: string
  progress: number
  isComplete: boolean
  createdAt: string
}

/**
 * 스켈레톤 커뮤니티 타입
 */
export interface SkeletonCommunity extends BaseSkeletonItem {
  name: string
  description: string
  memberCount: number
  isPublic: boolean
  createdAt: string
}

/**
 * 스켈레톤 멤버 타입
 */
export interface SkeletonMember extends BaseSkeletonItem {
  username: string
  nickname: string
  role: string
  joinedAt: string
}

/**
 * 스켈레톤 알림 타입
 */
export interface SkeletonNotification extends BaseSkeletonItem {
  title: string
  content: string
  createdAt: string
}

/**
 * 로딩 상태 타입
 */
export interface LoadingState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * 무한 스크롤 로더 타입
 */
export interface InfiniteLoader<T> {
  loadInitial: () => Promise<T[]>
  loadMore: () => Promise<T[]>
  hasMore: () => boolean
  isLoading: () => boolean
  getAllData: () => T[]
  reset: () => void
}

/**
 * 지연 이미지 로더 타입
 */
export interface LazyImageLoader {
  observe: (img: HTMLImageElement) => void
  unobserve: (img: HTMLImageElement) => void
  disconnect: () => void
}

/**
 * 플레이스홀더 타입
 */
export type PlaceholderType = 'goal' | 'community' | 'member' | 'notification'

/**
 * 제네릭 함수 타입 (debounce/throttle용)
 */
export type GenericFunction<TArgs extends unknown[] = unknown[], TReturn = unknown> = (
  ...args: TArgs
) => TReturn
