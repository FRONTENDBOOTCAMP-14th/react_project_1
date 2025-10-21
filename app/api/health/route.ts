import { createSuccessResponse } from '@/lib/utils/response'

export const dynamic = 'force-static'

export async function GET() {
  return createSuccessResponse({ time: new Date().toISOString() })
}
