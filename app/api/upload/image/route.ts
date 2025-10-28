/**
 * 이미지 업로드 API
 * - 경로: /api/upload/image
 * - 메서드: POST
 * - Supabase Storage를 사용하여 이미지를 업로드합니다.
 */

import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import { requireAuth } from '@/lib/middleware/auth'
import { supabase } from '@/lib/supabase'
import type { NextRequest } from 'next/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const STORAGE_BUCKET = 'community-images'

/**
 * POST /api/upload/image
 * - 이미지 파일을 업로드합니다.
 *
 * 요청 Body (multipart/form-data)
 * - file: 업로드할 이미지 파일
 *
 * 응답
 * - 200: { success: true, data: { url: string, path: string } }
 * - 400: { success: false, error: string }
 * - 401: { success: false, error: string }
 * - 500: { success: false, error: string }
 */
export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const { error: authError } = await requireAuth()
    if (authError) return authError

    // FormData 파싱
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return createErrorResponse('파일이 제공되지 않았습니다.', 400)
    }

    // 파일 타입 검증
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return createErrorResponse(
        `지원하지 않는 파일 형식입니다. 허용된 형식: ${ALLOWED_FILE_TYPES.join(', ')}`,
        400
      )
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse(
        `파일 크기가 너무 큽니다. 최대 크기: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        400
      )
    }

    // 파일명 생성 (타임스탬프 + 랜덤 문자열 + 확장자)
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomStr}.${fileExt}`
    const filePath = `communities/${fileName}`

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      console.error('Supabase upload error:', error)
      return createErrorResponse(`이미지 업로드 실패: ${error.message}`, 500)
    }

    // 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path)

    return createSuccessResponse(
      {
        url: publicUrl,
        path: data.path,
      },
      200
    )
  } catch (err: unknown) {
    console.error('Error uploading image:', err)
    return createErrorResponse(
      err instanceof Error ? err.message : '이미지 업로드 중 오류가 발생했습니다.',
      500
    )
  }
}
