import prisma from '@/lib/prisma'
import { isValidEmail, isValidNickname } from '@/lib/utils/validation'
import type { User } from '@prisma/client'

/**
 * 소셜 provider와 providerId로 사용자를 조회합니다.
 *
 * - 입력값은 trim 처리됩니다.
 * - provider 또는 providerId가 비어있으면 null을 반환합니다.
 *
 * @param provider - 소셜 로그인 제공자 (예: 'kakao', 'google')
 * @param providerId - 소셜 제공자 내 사용자 식별자
 * @returns 해당 사용자가 존재하면 User, 없으면 null
 */
export async function findByProviderId(provider: string, providerId: string): Promise<User | null> {
  const p = provider?.trim()
  const pid = providerId?.trim()
  if (!p || !pid) return null
  return prisma.user.findFirst({
    where: { provider: p, providerId: pid, deletedAt: null },
  })
}

/**
 * 이메일 중복 여부를 확인합니다.
 *
 * - 이메일은 trim 및 소문자(normalize) 처리됩니다.
 * - 형식이 유효하지 않으면 false를 반환합니다.
 *
 * @param email - 확인할 이메일
 * @returns 이미 사용 중이면 true, 그렇지 않으면 false
 */
export async function isEmailTaken(email: string): Promise<boolean> {
  const normalized = email?.trim().toLowerCase()
  if (!normalized || !isValidEmail(normalized)) return false
  const c = await prisma.user.count({
    where: { email: { equals: normalized, mode: 'insensitive' }, deletedAt: null },
  })
  return c > 0
}

/**
 * 닉네임 중복 여부를 확인합니다.
 *
 * - 닉네임은 trim 처리됩니다.
 * - 형식이 유효하지 않으면 false를 반환합니다.
 *
 * @param nickname - 확인할 닉네임
 * @returns 이미 사용 중이면 true, 그렇지 않으면 false
 */
export async function isNicknameTaken(nickname: string): Promise<boolean> {
  const normalized = nickname?.trim()
  if (!normalized || !isValidNickname(normalized)) return false
  const c = await prisma.user.count({
    where: { nickname: { equals: normalized, mode: 'insensitive' }, deletedAt: null },
  })
  return c > 0
}

/**
 * 사용자 생성 입력 타입
 */
export interface CreateUserInput {
  provider: string
  providerId: string
  email?: string | null
  username: string
  nickname?: string | null
}

/**
 * 새 사용자를 생성합니다.
 *
 * - provider, providerId, username, nickname은 trim 처리됩니다.
 * - 이메일은 trim 및 소문자(normalize) 처리됩니다.
 *
 * @param input - 사용자 생성에 필요한 데이터
 * @returns 생성된 사용자 레코드
 */
export async function createUser(input: CreateUserInput): Promise<User> {
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
