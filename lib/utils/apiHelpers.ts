/**
 * API 공통 유틸리티
 * 페이지네이션, 응답 처리, 검증 등
 */

import { createSuccessResponse } from '@/lib/utils/response'
import { isValidLength } from '@/lib/utils/validation'
import type { NextRequest } from 'next/server'

/**
 * 페이지네이션 파라미터 추출
 */
export function getPaginationParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

/**
 * 필터 파라미터 추출 (boolean 타입)
 */
export function getBooleanParam(searchParams: URLSearchParams, key: string): boolean | undefined {
  const value = searchParams.get(key)
  if (value === null) return undefined
  return value === 'true'
}

/**
 * 필터 파라미터 추출 (string 타입)
 */
export function getStringParam(searchParams: URLSearchParams, key: string): string | undefined {
  return searchParams.get(key) || undefined
}

/**
 * 필터 파라미터 추출 (string array 타입)
 */
export function getStringArrayParam(searchParams: URLSearchParams, key: string): string[] {
  return searchParams.getAll(key).filter(Boolean)
}

/**
 * API 응답 래퍼 (Prisma findMany + count 병렬 처리)
 */
export async function withPagination(
  findManyQuery: Promise<unknown[]>,
  countQuery: Promise<number>,
  pagination: { page: number; limit: number; skip: number }
) {
  const { page, limit } = pagination

  const [items, total] = await Promise.all([findManyQuery, countQuery])

  const paginationInfo = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }

  return createSuccessResponse({
    data: items,
    count: items.length,
    pagination: paginationInfo,
  })
}

/**
 * 커뮤니티 멤버십 생성 검증
 */
export function validateMemberCreation(data: { clubId?: string; userId?: string; role?: string }) {
  const errors: string[] = []

  if (!data.clubId || !isValidLength(data.clubId, { min: 1 })) {
    errors.push('유효한 커뮤니티 ID가 필요합니다.')
  }

  if (!data.userId || !isValidLength(data.userId, { min: 1 })) {
    errors.push('유효한 사용자 ID가 필요합니다.')
  }

  if (data.role && !['admin', 'member'].includes(data.role)) {
    errors.push('유효한 역할을 선택해주세요.')
  }

  return errors
}

/**
 * 목표 생성 검증
 */
export function validateGoalCreation(data: {
  ownerId?: string
  title?: string
  startDate?: string | Date
  endDate?: string | Date
}) {
  const errors: string[] = []

  if (!data.ownerId || !isValidLength(data.ownerId, { min: 1 })) {
    errors.push('목표 소유자 ID가 필요합니다.')
  }

  if (!data.title || !isValidLength(data.title, { min: 1, max: 100 })) {
    errors.push('목표 제목은 1-100자 사이여야 합니다.')
  }

  if (!data.startDate || !data.endDate) {
    errors.push('시작일과 종료일이 필요합니다.')
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.push('유효한 날짜 형식이어야 합니다.')
    } else if (start >= end) {
      errors.push('시작일은 종료일 이전이어야 합니다.')
    }
  }

  return errors
}
