import { err, ok, type Result } from '@/lib/errors/result'
import type { CreateGoalInput, UpdateGoalInput } from '@/lib/types/goal'

export interface ValidatedGoalCreationData {
  ownerId: string
  clubId: string | null
  roundId: string | null
  title: string
  description: string | null
  isTeam: boolean
  isComplete: boolean
  startDate: Date
  endDate: Date
}

export interface ValidatedGoalUpdateData {
  title?: string
  description?: string | null
  isTeam?: boolean
  isComplete?: boolean
  roundId?: string | null
  startDate?: Date
  endDate?: Date
  updatedAt: Date
}

export interface ExistingGoalDates {
  startDate: Date | null
  endDate: Date | null
}

/**
 * 목표 생성 입력값 검증 및 정제
 */
export function validateGoalCreation(
  data: Partial<CreateGoalInput>,
  authUserId: string
): Result<ValidatedGoalCreationData, Error> {
  const title = data.title?.trim()
  if (!title || title.length === 0) {
    return err(new Error('제목은 1자 이상 100자 이하여야 합니다'))
  }
  if (title.length > 100) {
    return err(new Error('제목은 1자 이상 100자 이하여야 합니다'))
  }

  if (data.description && data.description.length > 1000) {
    return err(new Error('설명은 1000자 이하여야 합니다'))
  }

  if (data.isTeam && !data.clubId) {
    return err(new Error('팀 목표는 커뮤니티(clubId) 지정이 필수입니다'))
  }

  if (!data.startDate) {
    return err(new Error('시작 날짜는 필수입니다'))
  }
  if (!data.endDate) {
    return err(new Error('종료 날짜는 필수입니다'))
  }

  const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate)
  const endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate)

  if (Number.isNaN(startDate.getTime())) {
    return err(new Error('유효하지 않은 시작 날짜 형식입니다'))
  }
  if (Number.isNaN(endDate.getTime())) {
    return err(new Error('유효하지 않은 종료 날짜 형식입니다'))
  }

  if (startDate.getTime() > endDate.getTime()) {
    return err(new Error('종료 시간은 시작 시간 이후여야 합니다'))
  }

  return ok({
    ownerId: authUserId,
    clubId: data.clubId || null,
    roundId: data.roundId || null,
    title,
    description: data.description?.trim() || null,
    isTeam: Boolean(data.isTeam),
    isComplete: Boolean(data.isComplete),
    startDate,
    endDate,
  })
}

/**
 * 목표 수정 데이터 검증 및 정제
 */
export function validateGoalUpdate(
  data: UpdateGoalInput,
  existing?: ExistingGoalDates
): Result<ValidatedGoalUpdateData, Error> {
  if (
    data.title === undefined &&
    data.description === undefined &&
    data.isTeam === undefined &&
    data.isComplete === undefined &&
    data.roundId === undefined &&
    data.startDate === undefined &&
    data.endDate === undefined
  ) {
    return err(new Error('수정할 내용이 없습니다'))
  }

  const result: ValidatedGoalUpdateData = {
    updatedAt: new Date(),
  }

  if (data.title !== undefined) {
    const trimmed = data.title.trim()
    if (trimmed.length === 0 || trimmed.length > 100) {
      return err(new Error('제목은 1자 이상 100자 이하여야 합니다'))
    }
    result.title = trimmed
  }

  if (data.description !== undefined) {
    if (data.description && data.description.length > 1000) {
      return err(new Error('설명은 1000자 이하여야 합니다'))
    }
    result.description = data.description?.trim() || null
  }

  if (data.isTeam !== undefined) {
    result.isTeam = Boolean(data.isTeam)
  }

  if (data.isComplete !== undefined) {
    result.isComplete = Boolean(data.isComplete)
  }

  if (data.roundId !== undefined) {
    result.roundId = data.roundId || null
  }

  if (data.startDate !== undefined) {
    const start = data.startDate instanceof Date ? data.startDate : new Date(data.startDate)
    if (Number.isNaN(start.getTime())) {
      return err(new Error('유효하지 않은 시작 날짜 형식입니다'))
    }
    result.startDate = start
  }

  if (data.endDate !== undefined) {
    const end = data.endDate instanceof Date ? data.endDate : new Date(data.endDate)
    if (Number.isNaN(end.getTime())) {
      return err(new Error('유효하지 않은 종료 날짜 형식입니다'))
    }
    result.endDate = end
  }

  const effectiveStart = data.startDate !== undefined ? result.startDate : existing?.startDate
  const effectiveEnd = data.endDate !== undefined ? result.endDate : existing?.endDate

  if (effectiveStart && effectiveEnd && effectiveStart.getTime() > effectiveEnd.getTime()) {
    return err(new Error('종료 시간은 시작 시간 이후여야 합니다'))
  }

  return ok(result)
}

/**
 * 목표 관리 권한 확인
 */
export function canManageGoal(ownerId: string, currentUserId: string): boolean {
  return ownerId === currentUserId
}
