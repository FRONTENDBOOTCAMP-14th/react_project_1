import regionData from './region.json'
import type { Region } from '@/lib/types/common'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response'

export async function GET() {
  try {
    const data: Region[] = regionData
    return createSuccessResponse(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    return createErrorResponse(`지역 데이터를 불러오는 중 오류가 발생했습니다: ${errorMessage}`)
  }
}
