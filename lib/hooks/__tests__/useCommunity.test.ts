import { renderHook, waitFor } from '@testing-library/react'
import { MESSAGES } from '@/constants'
import { useCommunity } from '../useCommunity'

global.fetch = jest.fn()

describe('useCommunity', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('id가 주어지면 커뮤니티 데이터를 정상적으로 조회한다', async () => {
    const mockCommunity = {
      clubId: 'club-1',
      name: '테스트 커뮤니티',
      description: '설명',
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockCommunity,
      }),
    })

    const { result } = renderHook(() => useCommunity('club-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.community).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.community).toEqual(mockCommunity)
    expect(result.current.error).toBeNull()
  })

  it('id가 빈 문자열이면 조회하지 않고 loading: false, community: null로 유지된다', async () => {
    const { result } = renderHook(() => useCommunity(''))

    expect(result.current.loading).toBe(false)
    expect(result.current.community).toBeNull()
    expect(result.current.error).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('HTTP 500 에러 시 사용자 친화적인 도메인 에러 메시지를 설정한다', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    const { result } = renderHook(() => useCommunity('club-error'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.community).toBeNull()
    expect(result.current.error).toBe(MESSAGES.ERROR.FAILED_TO_LOAD_COMMUNITY)
  })

  it('조회 실패 후 다른 id로 변경 시 이전 error를 리셋하고 새 데이터를 로드한다 (P1 회귀 방지)', async () => {
    // 첫 번째 호출: 실패
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    const { result, rerender } = renderHook(({ id }) => useCommunity(id), {
      initialProps: { id: 'invalid-id' },
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(MESSAGES.ERROR.FAILED_TO_LOAD_COMMUNITY)
    })

    // 두 번째 호출: 성공
    const validCommunity = {
      clubId: 'valid-id',
      name: '정상 커뮤니티',
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: validCommunity,
      }),
    })

    rerender({ id: 'valid-id' })

    // 리렌더 즉시 이전 error 리셋 및 loading: true
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.community).toEqual(validCommunity)
    expect(result.current.error).toBeNull()
  })
})
