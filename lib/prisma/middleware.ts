/**
 * Prisma Extensions - 소프트 삭제 자동화
 *
 * 기능:
 * 1. find 계열 쿼리에 자동으로 deletedAt: null 조건 추가
 * 2. delete 쿼리를 소프트 삭제로 자동 변환
 * 3. 비즈니스 로직에서 deletedAt을 신경 쓸 필요 없음
 */

import { Prisma, type PrismaClient } from '@prisma/client'

// 소프트 삭제가 적용된 모델 목록
const SOFT_DELETE_MODELS = [
  'User',
  'Community',
  'StudyGoal',
  'Reaction',
  'CommunityMember',
  'Round',
  'Notification',
  'Attendance',
] as const

type SoftDeleteModel = (typeof SOFT_DELETE_MODELS)[number]

/**
 * 모델이 소프트 삭제 대상인지 확인
 */
function isSoftDeleteModel(model: string): model is SoftDeleteModel {
  return SOFT_DELETE_MODELS.includes(model as SoftDeleteModel)
}

/**
 * 쿼리에 deletedAt: null 조건 추가
 */
function addSoftDeleteCondition(args: Record<string, unknown>): Record<string, unknown> {
  // 이미 where 조건이 있는 경우 병합
  if (args.where) {
    return {
      ...args,
      where: {
        ...(args.where as Record<string, unknown>),
        deletedAt: null,
      },
    }
  }

  // where 조건이 없는 경우 새로 생성
  return {
    ...args,
    where: {
      deletedAt: null,
    },
  }
}

/**
 * 소프트 삭제를 위한 Prisma Extension
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: 'soft-delete',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // 소프트 삭제 대상 모델이 아닌 경우 원래대로 실행
        if (!model || !isSoftDeleteModel(model)) {
          return query(args)
        }

        // find 계열 쿼리에 deletedAt: null 조건 추가
        if (operation.startsWith('find')) {
          const modifiedArgs = addSoftDeleteCondition(args)
          return query(modifiedArgs)
        }

        // delete 쿼리를 소프트 삭제로 변환
        if (operation === 'delete') {
          // Prisma Extension 내에서는 query 함수를 사용해야 함
          return query({
            ...args,
            data: { deletedAt: new Date() },
          })
        }

        // deleteMany 쿼리를 소프트 삭제로 변환
        if (operation === 'deleteMany') {
          return query({
            ...args,
            data: { deletedAt: new Date() },
          })
        }

        // 그 외 쿼리는 원래대로 실행
        return query(args)
      },
    },
  },
})

/**
 * Prisma 클라이언트에 소프트 삭제 확장 적용하는 함수
 */
export function applySoftDeleteExtension(prisma: PrismaClient) {
  return prisma.$extends(softDeleteExtension)
}
