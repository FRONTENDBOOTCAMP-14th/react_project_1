import type { CreateRoundRequest, Round } from '@/lib/types/round'
import { toast } from 'sonner'

/**
 * 라운드 관련 API 서비스
 * 데이터 페칭 로직을 컴포넌트에서 분리하여 재사용성과 테스트 용이성을 높입니다.
 */
export class RoundService {
  private static baseUrl = '/api/rounds'

  /**
   * 커뮤니티의 모든 라운드를 가져옵니다.
   * @param clubId - 커뮤니티 ID
   * @returns 라운드 목록
   */
  static async getRounds(clubId: string): Promise<Round[]> {
    const response = await fetch(`${this.baseUrl}?clubId=${clubId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch rounds: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data.data
  }

  /**
   * 새로운 라운드를 생성합니다.
   * @param data - 라운드 생성 데이터
   * @returns 생성된 라운드 정보
   */
  static async createRound(data: CreateRoundRequest): Promise<Round> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create round')
    }

    const createdRound = await response.json()
    toast.success('새로운 회차가 생성되었습니다')
    return createdRound
  }

  /**
   * 라운드를 업데이트합니다.
   * @param roundId - 라운드 ID
   * @param data - 업데이트할 데이터
   * @returns 업데이트된 라운드 정보
   */
  static async updateRound(roundId: string, data: Partial<CreateRoundRequest>): Promise<Round> {
    const response = await fetch(`${this.baseUrl}/${roundId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update round')
    }

    const updatedRound = await response.json()
    toast.success('회차 정보가 업데이트되었습니다')
    return updatedRound
  }

  /**
   * 라운드를 삭제합니다.
   * @param roundId - 라운드 ID
   */
  static async deleteRound(roundId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${roundId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete round')
    }

    toast.success('회차가 삭제되었습니다')
  }
}
