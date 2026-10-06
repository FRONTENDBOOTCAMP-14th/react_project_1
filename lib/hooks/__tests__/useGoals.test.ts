import { renderHook, waitFor } from '@testing-library/react'
import { MESSAGES } from '@/constants'
import { useGoals } from '../useGoals'

global.fetch = jest.fn()

describe('useGoals', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('clubId가 주어지면 팀 및 개인 목표를 병렬로 조회한다', async () => {
    const mockTeamGoals = [{ goalId: 'g-1', title: '팀 목표', isTeam: true }]
    const mockPersonalGoals = [{ goalId: 'g-2', title: '개인 목표', isTeam: false }]

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockTeamGoals,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockPersonalGoals,
        }),
      })

    const { result } = renderHook(() => useGoals('club-1'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.goals.team).toEqual(mockTeamGoals)
    expect(result.current.goals.personal).toEqual(mockPersonalGoals)
    expect(result.current.error).toBeNull()
  })

  it('팀 목표는 성공하고 개인 목표는 실패한 경우에도 에러 없이 개인 목표만 빈 배열로 처리한다 (부분 실패 내결함성)', async () => {
    const mockTeamGoals = [{ goalId: 'g-1', title: '팀 목표', isTeam: true }]

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockTeamGoals,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: '개인 목표 없음',
        }),
      })

    const { result } = renderHook(() => useGoals('club-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.goals.team).toEqual(mockTeamGoals)
    expect(result.current.goals.personal).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('네트워크 요청 실패 시 도메인 에러 메시지를 설정한다', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useGoals('club-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(MESSAGES.ERROR.FAILED_TO_LOAD_GOALS)
    expect(result.current.goals.team).toEqual([])
    expect(result.current.goals.personal).toEqual([])
  })

  it('clubId가 빈 문자열이면 조회하지 않고 loading: false로 유지된다', async () => {
    const { result } = renderHook(() => useGoals(''))

    expect(result.current.loading).toBe(false)
    expect(result.current.goals).toEqual({ team: [], personal: [] })
    expect(fetch).not.toHaveBeenCalled()
  })
})
