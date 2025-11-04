import { PrismaClient } from '@prisma/client'
import { applySoftDeleteExtension } from './prisma/middleware'

// Prevent multiple client instances in Next.js dev (HMR)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// 기본 Prisma 클라이언트 생성
const basePrisma = new PrismaClient({
  log: ['error', 'warn'],
})

// 소프트 삭제 확장 적용
const prismaWithExtension = applySoftDeleteExtension(basePrisma)

// 확장된 클라이언트를 기본 PrismaClient로 타입 단언
export const prisma = prismaWithExtension as unknown as PrismaClient

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
