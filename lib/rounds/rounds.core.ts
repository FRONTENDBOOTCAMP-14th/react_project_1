import { err, ok, type Result } from '@/lib/errors/result'
import type { CreateRoundRequest } from '@/lib/types/round'

export interface ValidatedRoundCreationData {
  clubId: string
  roundNumber: number
  startDate: Date | null
  endDate: Date | null
  location: string | null
}

export interface ValidatedRoundUpdateData {
  roundNumber?: number
  startDate?: Date | null
  endDate?: Date | null
  location?: string | null
}

/**
 * 라운드 시간 윈도우 판별 (순수 함수)
 * - 현재 시각이 startDate 이상, endDate 이하인 경우 true
 * - startDate 또는 endDate가 없거나 잘못된 경우 false
 */
export function isWithinRoundWindow(
  now: Date,
  startDate: Date | null | undefined,
  endDate: Date | null | undefined
): boolean {
  if (!startDate || !endDate) {
    return false
  }

  const startTime = startDate.getTime()
  const endTime = endDate.getTime()
  const nowTime = now.getTime()

  if (Number.isNaN(startTime) || Number.isNaN(endTime) || Number.isNaN(nowTime)) {
    return false
  }

  return nowTime >= startTime && nowTime <= endTime
}

/**
 * 라운드 생성 입력 검증 및 정제 (순수 함수)
 */
export function validateRoundCreation(
  data: CreateRoundRequest
): Result<ValidatedRoundCreationData, Error> {
  if (!data.clubId || data.clubId.trim() === '') {
    return err(new Error('clubId는 필수입니다'))
  }

  if (typeof data.roundNumber !== 'number' || data.roundNumber < 1) {
    return err(new Error('roundNumber는 1 이상의 숫자여야 합니다'))
  }

  const startDate = data.startDate ? new Date(data.startDate) : null
  const endDate = data.endDate ? new Date(data.endDate) : null

  if (startDate && Number.isNaN(startDate.getTime())) {
    return err(new Error('유효하지 않은 시작 날짜 형식입니다'))
  }

  if (endDate && Number.isNaN(endDate.getTime())) {
    return err(new Error('유효하지 않은 종료 날짜 형식입니다'))
  }

  if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
    return err(new Error('종료 시간은 시작 시간 이후여야 합니다'))
  }

  return ok({
    clubId: data.clubId,
    roundNumber: data.roundNumber,
    startDate,
    endDate,
    location: data.location || null,
  })
}

export interface ExistingRoundDates {
  startDate: Date | null
  endDate: Date | null
}

/**
 * 라운드 수정 입력 검증 및 정제 (순수 함수)
 * - 기존 라운드 일정(existing)이 주어지면 부분 수정 시에도 시작/종료 일관성을 검증합니다.
 */
export function validateRoundUpdate(
  data: Partial<CreateRoundRequest>,
  existing?: ExistingRoundDates
): Result<ValidatedRoundUpdateData, Error> {
  const result: ValidatedRoundUpdateData = {}

  if (data.roundNumber !== undefined) {
    if (typeof data.roundNumber !== 'number' || data.roundNumber < 1) {
      return err(new Error('roundNumber는 1 이상의 숫자여야 합니다'))
    }
    result.roundNumber = data.roundNumber
  }

  if (data.startDate !== undefined) {
    const startDate = data.startDate ? new Date(data.startDate) : null
    if (startDate && Number.isNaN(startDate.getTime())) {
      return err(new Error('유효하지 않은 시작 날짜 형식입니다'))
    }
    result.startDate = startDate
  }

  if (data.endDate !== undefined) {
    const endDate = data.endDate ? new Date(data.endDate) : null
    if (endDate && Number.isNaN(endDate.getTime())) {
      return err(new Error('유효하지 않은 종료 날짜 형식입니다'))
    }
    result.endDate = endDate
  }

  // 기존 값과 병합한 유효 시작/종료 일자로 선후관계 검증
  const effectiveStartDate = data.startDate !== undefined ? result.startDate : existing?.startDate
  const effectiveEndDate = data.endDate !== undefined ? result.endDate : existing?.endDate

  if (
    effectiveStartDate &&
    effectiveEndDate &&
    effectiveStartDate.getTime() > effectiveEndDate.getTime()
  ) {
    return err(new Error('종료 시간은 시작 시간 이후여야 합니다'))
  }

  if (data.location !== undefined) {
    result.location = data.location || null
  }

  return ok(result)
}
