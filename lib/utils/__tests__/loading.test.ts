/**
 * loading.ts 유틸리티 테스트
 */

import {
  debounce,
  throttle,
  delay,
  generateSkeletonItems,
  generateSkeletonGoals,
  generateSkeletonCommunities,
  generateSkeletonMembers,
  createLoadingState,
  updateLoadingState,
  withLoadingState,
} from '../loading'

describe('loading utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('debounce', () => {
    it('지정된 시간 후에 함수를 호출해야 함', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 1000)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1000)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('연속 호출 시 마지막 호출만 실행해야 함', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 1000)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      jest.advanceTimersByTime(1000)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('인자를 올바르게 전달해야 함', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 1000)

      debouncedFn('test', 123)
      jest.advanceTimersByTime(1000)

      expect(mockFn).toHaveBeenCalledWith('test', 123)
    })
  })

  describe('throttle', () => {
    it('첫 번째 호출을 즉시 실행해야 함', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 1000)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('대기 시간 동안 추가 호출을 무시해야 함', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 1000)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('대기 시간 후에는 다시 호출할 수 있어야 함', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 1000)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(1000)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('인자를 올바르게 전달해야 함', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 1000)

      throttledFn('test', 123)
      expect(mockFn).toHaveBeenCalledWith('test', 123)
    })
  })

  describe('delay', () => {
    it('지정된 시간 후에 resolve되어야 함', async () => {
      const promise = delay(1000)

      jest.advanceTimersByTime(1000)

      await expect(promise).resolves.toBeUndefined()
    })
  })

  describe('generateSkeletonItems', () => {
    it('지정된 개수의 스켈레톤 아이템을 생성해야 함', () => {
      const items = generateSkeletonItems(5)

      expect(items).toHaveLength(5)
      expect(items[0]).toHaveProperty('id', 'skeleton-0')
      expect(items[0]).toHaveProperty('isSkeleton', true)
    })

    it('템플릿 속성을 포함해야 함', () => {
      const template = { title: 'Test', count: 10 }
      const items = generateSkeletonItems(3, template)

      expect(items).toHaveLength(3)
      expect(items[0]).toMatchObject({
        id: 'skeleton-0',
        isSkeleton: true,
        title: 'Test',
        count: 10,
      })
    })

    it('각 아이템은 고유한 ID를 가져야 함', () => {
      const items = generateSkeletonItems(3)

      expect(items[0].id).toBe('skeleton-0')
      expect(items[1].id).toBe('skeleton-1')
      expect(items[2].id).toBe('skeleton-2')
    })
  })

  describe('generateSkeletonGoals', () => {
    it('기본값으로 5개의 목표 스켈레톤을 생성해야 함', () => {
      const goals = generateSkeletonGoals()

      expect(goals).toHaveLength(5)
      expect(goals[0]).toHaveProperty('title')
      expect(goals[0]).toHaveProperty('description')
      expect(goals[0]).toHaveProperty('progress', 0)
      expect(goals[0]).toHaveProperty('isComplete', false)
      expect(goals[0]).toHaveProperty('createdAt')
    })

    it('지정된 개수의 목표 스켈레톤을 생성해야 함', () => {
      const goals = generateSkeletonGoals(3)

      expect(goals).toHaveLength(3)
    })
  })

  describe('generateSkeletonCommunities', () => {
    it('기본값으로 3개의 커뮤니티 스켈레톤을 생성해야 함', () => {
      const communities = generateSkeletonCommunities()

      expect(communities).toHaveLength(3)
      expect(communities[0]).toHaveProperty('name')
      expect(communities[0]).toHaveProperty('description')
      expect(communities[0]).toHaveProperty('memberCount', 0)
      expect(communities[0]).toHaveProperty('isPublic', true)
      expect(communities[0]).toHaveProperty('createdAt')
    })

    it('지정된 개수의 커뮤니티 스켈레톤을 생성해야 함', () => {
      const communities = generateSkeletonCommunities(7)

      expect(communities).toHaveLength(7)
    })
  })

  describe('generateSkeletonMembers', () => {
    it('기본값으로 8개의 멤버 스켈레톤을 생성해야 함', () => {
      const members = generateSkeletonMembers()

      expect(members).toHaveLength(8)
      expect(members[0]).toHaveProperty('username')
      expect(members[0]).toHaveProperty('nickname')
      expect(members[0]).toHaveProperty('role', 'member')
      expect(members[0]).toHaveProperty('joinedAt')
    })

    it('지정된 개수의 멤버 스켈레톤을 생성해야 함', () => {
      const members = generateSkeletonMembers(12)

      expect(members).toHaveLength(12)
    })
  })

  describe('createLoadingState', () => {
    it('초기 로딩 상태를 생성해야 함', () => {
      const state = createLoadingState()

      expect(state).toEqual({
        data: null,
        loading: false,
        error: null,
      })
    })

    it('초기 데이터와 함께 로딩 상태를 생성해야 함', () => {
      const initialData = { id: 1, name: 'Test' }
      const state = createLoadingState(initialData)

      expect(state).toEqual({
        data: initialData,
        loading: false,
        error: null,
      })
    })
  })

  describe('updateLoadingState', () => {
    it('로딩 상태를 업데이트해야 함', () => {
      const state = createLoadingState()
      const updatedState = updateLoadingState(state, { loading: true })

      expect(updatedState).toEqual({
        data: null,
        loading: true,
        error: null,
      })
    })

    it('여러 속성을 동시에 업데이트해야 함', () => {
      const state = createLoadingState()
      const updatedState = updateLoadingState(state, {
        loading: false,
        data: { result: 'success' },
        error: null,
      })

      expect(updatedState).toEqual({
        data: { result: 'success' },
        loading: false,
        error: null,
      })
    })

    it('기존 상태는 변경되지 않아야 함 (불변성)', () => {
      const state = createLoadingState()
      const originalState = { ...state }

      updateLoadingState(state, { loading: true })

      expect(state).toEqual(originalState)
    })
  })

  describe('withLoadingState', () => {
    it('비동기 작업 성공 시 로딩 상태를 올바르게 업데이트해야 함', async () => {
      const loadingState = createLoadingState()
      const mockStateChange = jest.fn()
      const asyncFn = jest.fn().mockResolvedValue('success')

      jest.useRealTimers()

      const result = await withLoadingState(loadingState, asyncFn, mockStateChange)

      expect(result).toBe('success')
      expect(mockStateChange).toHaveBeenCalledTimes(2)

      // 첫 번째 호출: 로딩 시작
      expect(mockStateChange).toHaveBeenNthCalledWith(1, {
        data: null,
        loading: true,
        error: null,
      })

      // 두 번째 호출: 로딩 완료
      expect(mockStateChange).toHaveBeenNthCalledWith(2, {
        data: 'success',
        loading: false,
        error: null,
      })
    })

    it('비동기 작업 실패 시 에러 상태를 설정해야 함', async () => {
      const loadingState = createLoadingState()
      const mockStateChange = jest.fn()
      const error = new Error('Test error')
      const asyncFn = jest.fn().mockRejectedValue(error)

      jest.useRealTimers()

      await expect(withLoadingState(loadingState, asyncFn, mockStateChange)).rejects.toThrow(
        'Test error'
      )

      expect(mockStateChange).toHaveBeenCalledTimes(2)

      // 두 번째 호출: 에러 상태
      expect(mockStateChange).toHaveBeenNthCalledWith(2, {
        data: null,
        loading: false,
        error: 'Test error',
      })
    })

    it('에러가 Error 객체가 아닌 경우 기본 메시지를 사용해야 함', async () => {
      const loadingState = createLoadingState()
      const mockStateChange = jest.fn()
      const asyncFn = jest.fn().mockRejectedValue('string error')

      jest.useRealTimers()

      await expect(withLoadingState(loadingState, asyncFn, mockStateChange)).rejects.toBe(
        'string error'
      )

      expect(mockStateChange).toHaveBeenNthCalledWith(2, {
        data: null,
        loading: false,
        error: 'Unknown error',
      })
    })
  })
})
