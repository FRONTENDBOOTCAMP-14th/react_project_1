import { renderHook, waitFor } from '@testing-library/react'
import { MESSAGES } from '@/constants'
import { useRounds } from '../useRounds'

global.fetch = jest.fn()

describe('useRounds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('clubId가 주어지면 라운드 목록을 조회하고 첫 번째 라운드를 currentRound로 설정한다', async () => {
    const mockRounds = [
      { roundId: 'r-1', roundNumber: 1, clubId: 'club-1' },
      { roundId: 'r-2', roundNumber: 2, clubId: 'club-1' },
    ]
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockRounds,
      }),
    })

    const { result } = renderHook(() => useRounds('club-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.rounds).toEqual([])
    expect(result.current.currentRound).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.rounds).toEqual(mockRounds)
    expect(result.current.currentRound).toEqual(mockRounds[0])
    expect(result.current.error).toBeNull()
  })

  it('clubId가 빈 문자열이면 데이터를 조회하지 않고 빈 목록을 유지한다', async () => {
    const { result } = renderHook(() => useRounds(''))

    expect(result.current.loading).toBe(false)
    expect(result.current.rounds).toEqual([])
    expect(result.current.currentRound).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('API 응답이 success: false인 경우 빈 배열로 처리하고 에러를 발생시키지 않는다 (부분 실패 내결함성)', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: false,
        error: '데이터 없음',
      }),
    })

    const { result } = renderHook(() => useRounds('club-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.rounds).toEqual([])
    expect(result.current.currentRound).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('네트워크 오류 시 도메인 에러 메시지를 설정한다', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'))

    const { result } = renderHook(() => useRounds('club-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(MESSAGES.ERROR.FAILED_TO_LOAD_ROUNDS)
    expect(result.current.rounds).toEqual([])
    expect(result.current.currentRound).toBeNull()
  })

  it('clubId가 유효한 값에서 빈 문자열로 변경되면 상태가 초기화된다', async () => {
    const mockRounds = [{ roundId: 'r-1', roundNumber: 1, clubId: 'club-1' }]
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockRounds,
      }),
    })

    const { result, rerender } = renderHook(({ clubId }) => useRounds(clubId), {
      initialProps: { clubId: 'club-1' },
    })

    await waitFor(() => {
      expect(result.current.rounds).toEqual(mockRounds)
    })

    rerender({ clubId: '' })

    expect(result.current.rounds).toEqual([])
    expect(result.current.currentRound).toBeNull()
    expect(result.current.loading).toBe(false)
  })
})
