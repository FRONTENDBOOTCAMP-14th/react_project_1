import { renderHook, act } from '@testing-library/react'
import { useCursorPagination } from '../useCursorPagination'

describe('useCursorPagination initialData sync & reset', () => {
  const fetchFunction = jest.fn()

  it('initialData prop이 변경되면 훅 상태가 새로운 데이터로 갱신되어야 한다', () => {
    const initialData1 = {
      data: [{ id: '1' }],
      nextCursor: 'cur-1',
      hasMore: true,
      hasPrevious: false,
      totalCount: 1,
    }

    const { result, rerender } = renderHook(
      ({ initialData }) =>
        useCursorPagination({
          initialData,
          fetchFunction,
        }),
      { initialProps: { initialData: initialData1 } }
    )

    expect(result.current.data).toEqual([{ id: '1' }])

    const initialData2 = {
      data: [{ id: '2' }, { id: '3' }],
      nextCursor: 'cur-2',
      hasMore: false,
      hasPrevious: false,
      totalCount: 2,
    }

    rerender({ initialData: initialData2 })

    expect(result.current.data).toEqual([{ id: '2' }, { id: '3' }])
    expect(result.current.hasMore).toBe(false)
  })

  it('reset(newData) 호출 시 새로운 초기 데이터로 리셋되어야 한다', () => {
    const initialData1 = {
      data: [{ id: '1' }],
      nextCursor: 'cur-1',
      hasMore: true,
      hasPrevious: false,
      totalCount: 1,
    }

    const { result } = renderHook(() =>
      useCursorPagination({
        initialData: initialData1,
        fetchFunction,
      })
    )

    const updatedData = {
      data: [{ id: 'filtered-1' }],
      nextCursor: undefined,
      hasMore: false,
      hasPrevious: false,
      totalCount: 1,
    }

    act(() => {
      result.current.reset(updatedData)
    })

    expect(result.current.data).toEqual([{ id: 'filtered-1' }])
    expect(result.current.hasMore).toBe(false)
  })
})
