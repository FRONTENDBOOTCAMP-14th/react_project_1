import { renderHook, act, waitFor } from '@testing-library/react'
import { useAsyncData } from '../useAsyncData'

describe('useAsyncData', () => {
  it('비동기 데이터를 성공적으로 패칭하고 상태를 갱신한다', async () => {
    const mockFetcher = jest.fn().mockResolvedValue('test-data')

    const { result } = renderHook(() => useAsyncData(mockFetcher, { initialData: 'initial' }))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe('initial')
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe('test-data')
    expect(result.current.error).toBeNull()
    expect(mockFetcher).toHaveBeenCalledTimes(1)
  })

  it('fetcher가 실패하면 error 상태를 세팅하고 loading을 종료한다', async () => {
    const mockFetcher = jest.fn().mockRejectedValue(new Error('네트워크 오류'))

    const { result } = renderHook(() => useAsyncData(mockFetcher, { initialData: null }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('네트워크 오류')
  })

  it('enabled가 false인 경우 fetcher를 실행하지 않고 loading은 false로 유지된다', async () => {
    const mockFetcher = jest.fn().mockResolvedValue('test-data')

    const { result } = renderHook(() =>
      useAsyncData(mockFetcher, { initialData: 'initial', enabled: false })
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBe('initial')
    expect(mockFetcher).not.toHaveBeenCalled()
  })

  it('refetch 호출 시 loading이 true가 되고 데이터를 다시 패칭한다', async () => {
    let resolveFirst: (v: string) => void
    const mockFetcher = jest.fn().mockImplementationOnce(
      () =>
        new Promise<string>(resolve => {
          resolveFirst = resolve
        })
    )

    const { result } = renderHook(() => useAsyncData(mockFetcher, { initialData: 'initial' }))

    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveFirst('data-1')
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBe('data-1')
    })

    let resolveSecond: (v: string) => void
    mockFetcher.mockImplementationOnce(
      () =>
        new Promise<string>(resolve => {
          resolveSecond = resolve
        })
    )

    act(() => {
      void result.current.refetch()
    })

    // refetch 호출 즉시 loading은 true로 전이되어야 함
    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveSecond('data-2')
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBe('data-2')
    })

    expect(mockFetcher).toHaveBeenCalledTimes(2)
  })

  it('fetcher가 변경되면 이전 error를 리셋하고 loading을 true로 전이한 뒤 새 데이터를 패칭한다', async () => {
    const failingFetcher = jest.fn().mockRejectedValue(new Error('이전 에러'))
    const successFetcher = jest.fn().mockResolvedValue('새 데이터')

    const { result, rerender } = renderHook(
      ({ fetcher }) => useAsyncData(fetcher, { initialData: 'initial' }),
      { initialProps: { fetcher: failingFetcher } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('이전 에러')
    })

    // fetcher 변경
    rerender({ fetcher: successFetcher })

    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe('새 데이터')
    expect(result.current.error).toBeNull()
  })

  it('enabled가 true에서 false로 변경되면 데이터를 initialData로 리셋하고 loading을 false로 설정한다', async () => {
    const mockFetcher = jest.fn().mockResolvedValue('loaded-data')

    const { result, rerender } = renderHook(
      ({ enabled }) => useAsyncData(mockFetcher, { initialData: 'initial', enabled }),
      { initialProps: { enabled: true } }
    )

    await waitFor(() => {
      expect(result.current.data).toBe('loaded-data')
    })

    rerender({ enabled: false })

    expect(result.current.data).toBe('initial')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('언마운트 시 비동기 완료 결과가 상태를 업데이트하지 않는다', async () => {
    let resolvePromise: (value: string) => void
    const mockFetcher = jest.fn().mockImplementation(
      () =>
        new Promise<string>(resolve => {
          resolvePromise = resolve
        })
    )

    const { result, unmount } = renderHook(() =>
      useAsyncData(mockFetcher, { initialData: 'initial' })
    )

    expect(result.current.loading).toBe(true)

    unmount()

    await act(async () => {
      resolvePromise!('resolved-after-unmount')
    })

    // unmount 후에도 안전하게 에러 없이 통과
    expect(result.current.data).toBe('initial')
  })
})
