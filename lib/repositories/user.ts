import prisma from '@/lib/prisma'

export async function findByProviderId(provider: string, providerId: string) {
  return prisma.user.findFirst({ where: { provider, providerId, deletedAt: null } })
}

export async function isEmailTaken(email: string) {
  if (!email) return false
  const c = await prisma.user.count({ where: { email, deletedAt: null } })
  return c > 0
}

export async function isNicknameTaken(nickname: string) {
  if (!nickname) return false
  const c = await prisma.user.count({ where: { nickname, deletedAt: null } })
  return c > 0
}

export async function createUser(input: {
  provider: string
  providerId: string
  email?: string | null
  username: string
  nickname?: string | null
}) {
  return prisma.user.create({
    data: {
      provider: input.provider,
      providerId: input.providerId,
      email: input.email ?? null,
      username: input.username,
      nickname: input.nickname ?? null,
    },
  })
}
