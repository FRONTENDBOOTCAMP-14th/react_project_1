import { toast } from 'sonner'
import type { Community, UpdateCommunityInput } from '@/lib/types/community'

/**
 * 커뮤니티 관련 API 서비스
 * 데이터 페칭 로직을 컴포넌트에서 분리하여 재사용성과 테스트 용이성을 높입니다.
 */
export class CommunityService {
  private static baseUrl = '/api/communities'

  /**
   * 커뮤니티 정보를 가져옵니다.
   * @param clubId - 커뮤니티 ID
   * @returns 커뮤니티 정보
   */
  static async getCommunity(clubId: string): Promise<Community> {
    const response = await fetch(`${this.baseUrl}/${clubId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch community: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 커뮤니티 정보를 업데이트합니다.
   * @param clubId - 커뮤니티 ID
   * @param data - 업데이트할 데이터
   * @returns 업데이트된 커뮤니티 정보
   */
  static async updateCommunity(clubId: string, data: UpdateCommunityInput): Promise<Community> {
    const response = await fetch(`${this.baseUrl}/${clubId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update community')
    }

    const updatedCommunity = await response.json()
    toast.success('커뮤니티 정보가 업데이트되었습니다')
    return updatedCommunity
  }

  /**
   * 커뮤니티 이미지를 업로드합니다.
   * @param clubId - 커뮤니티 ID
   * @param file - 이미지 파일
   * @returns 업로드된 이미지 URL
   */
  static async uploadImage(clubId: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${this.baseUrl}/${clubId}/image`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const result = await response.json()
    toast.success('이미지가 업로드되었습니다')
    return result.imageUrl
  }

  /**
   * 커뮤니티를 삭제합니다.
   * @param clubId - 커뮤니티 ID
   */
  static async deleteCommunity(clubId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${clubId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete community')
    }

    toast.success('커뮤니티가 삭제되었습니다')
  }
}
