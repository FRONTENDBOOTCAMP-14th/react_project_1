/**
 * loading.ts 유틸리티 테스트
 */

import { debounce } from '../loading'

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
})
