import prisma from '@/lib/prisma'
import { isValidEmail, isValidNickname } from '@/lib/utils/validation'

export async function findByProviderId(provider: string, providerId: string) {
  const p = provider?.trim()
  const pid = providerId?.trim()
  if (!p || !pid) return null
  return prisma.user.findFirst({
    where: { provider: p, providerId: pid, deletedAt: null },
  })
}

export async function isEmailTaken(email: string) {
  const normalized = email?.trim().toLowerCase()
  if (!normalized || !isValidEmail(normalized)) return false
  const c = await prisma.user.count({
    where: { email: { equals: normalized, mode: 'insensitive' }, deletedAt: null },
  })
  return c > 0
}

export async function isNicknameTaken(nickname: string) {
  const normalized = nickname?.trim()
  if (!normalized || !isValidNickname(normalized)) return false
  const c = await prisma.user.count({
    where: { nickname: { equals: normalized, mode: 'insensitive' }, deletedAt: null },
  })
  return c > 0
}

export async function createUser(input: {
  provider: string
  providerId: string
  email?: string | null
  username: string
  nickname?: string | null
}) {
  const provider = input.provider?.trim()
  const providerId = input.providerId?.trim()
  const email = input.email ? input.email.trim().toLowerCase() : null
  const username = input.username?.trim()
  const nickname = input.nickname ? input.nickname.trim() : null

  return prisma.user.create({
    data: {
      provider,
      providerId,
      email,
      username,
      nickname,
    },
  })
}
