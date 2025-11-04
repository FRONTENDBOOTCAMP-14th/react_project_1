import { PrismaClient } from '@prisma/client'
import { applySoftDeleteMiddleware } from './prisma/middleware'

// Prevent multiple client instances in Next.js dev (HMR)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

// 소프트 삭제 미들웨어 적용
applySoftDeleteMiddleware(prisma)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
