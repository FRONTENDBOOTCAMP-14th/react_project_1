/**
 * loading.ts 유틸리티 테스트
 */

import { debounce, throttle, delay } from '../loading'

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
})
