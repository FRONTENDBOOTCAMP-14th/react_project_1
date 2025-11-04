/**
 * Prisma 미들웨어 - 소프트 삭제 자동화
 *
 * 기능:
 * 1. find 계열 쿼리에 자동으로 deletedAt: null 조건 추가
 * 2. delete 쿼리를 소프트 삭제로 자동 변환
 * 3. 비즈니스 로직에서 deletedAt을 신경 쓸 필요 없음
 */

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

  // where 조건이 없는 경우 새로 추가
  return {
    ...args,
    where: {
      deletedAt: null,
    },
  }
}

// Prisma 미들웨어 파라미터 타입 정의
interface MiddlewareParams {
  model?: string
  action: string
  args: Record<string, unknown>
  dataPath: string[]
  query: (args: Record<string, unknown>) => Promise<unknown>
}

/**
 * Prisma 미들웨어
 */
export const softDeleteMiddleware = async (
  params: MiddlewareParams,
  next: (params: MiddlewareParams) => Promise<unknown>
) => {
  const { model, action, args } = params

  // 소프트 삭제 대상 모델이 아닌 경우 원래 쿼리 실행
  if (!model || !isSoftDeleteModel(model)) {
    return next(params)
  }

  // Find 계열 쿼리에 deletedAt: null 조건 추가
  switch (action) {
    case 'findUnique':
    case 'findFirst':
    case 'findMany':
    case 'count':
    case 'aggregate':
      return next({
        ...params,
        args: addSoftDeleteCondition(args),
      })

    // Delete 쿼리를 소프트 삭제로 변환
    case 'delete':
      return next({
        ...params,
        action: 'update',
        args: {
          ...args,
          data: { deletedAt: new Date() },
        },
      })

    // DeleteMany 쿼리를 소프트 삭제로 변환
    case 'deleteMany':
      return next({
        ...params,
        action: 'updateMany',
        args: {
          ...args,
          data: { deletedAt: new Date() },
        },
      })

    // 그 외 쿼리는 원래대로 실행
    default:
      return next(params)
  }
}

// Prisma 클라이언트 타입 정의
interface PrismaClientWithMiddleware {
  $use: (
    middleware: (
      params: MiddlewareParams,
      next: (params: MiddlewareParams) => Promise<unknown>
    ) => Promise<unknown>
  ) => void
}

/**
 * Prisma 클라이언트에 미들웨어 적용하는 함수
 */
export function applySoftDeleteMiddleware(prisma: PrismaClientWithMiddleware) {
  prisma.$use(softDeleteMiddleware)
}
