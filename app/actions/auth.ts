'use server'

import { prisma } from '@/lib/prisma'
import { type ServerActionResponse, withServerAction } from '@/lib/utils/serverActions'
import { createRegistrationToken } from '@/lib/auth/token'
import { revalidatePath } from 'next/cache'

interface CheckEmailRequest {
  email: string
}

interface CheckNicknameRequest {
  nickname: string
}

interface RegisterRequest {
  providerId: string
  email: string
  username: string
  nickname: string
}

/**
 * Server Action: 이메일 중복 확인
 */
export async function checkEmailAction(
  data: CheckEmailRequest
): Promise<ServerActionResponse<{ available: boolean }>> {
  return withServerAction(
    async () => {
      const { email } = data

      if (!email) {
        throw new Error('이메일을 입력하세요.')
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
        },
        select: { userId: true },
      })

      return { available: !existingUser }
    },
    { errorMessage: '이메일 확인에 실패했습니다' }
  )
}

/**
 * Server Action: 닉네임 중복 확인
 */
export async function checkNicknameAction(
  data: CheckNicknameRequest
): Promise<ServerActionResponse<{ available: boolean }>> {
  return withServerAction(
    async () => {
      const { nickname } = data

      if (!nickname) {
        throw new Error('닉네임을 입력하세요.')
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          nickname,
          deletedAt: null,
        },
        select: { userId: true },
      })

      return { available: !existingUser }
    },
    { errorMessage: '닉네임 확인에 실패했습니다' }
  )
}

/**
 * Server Action: 사용자 회원가입
 */
export async function registerAction(
  data: RegisterRequest
): Promise<ServerActionResponse<{ userId: string; registrationToken: string }>> {
  return withServerAction(
    async () => {
      const { providerId, email, username, nickname } = data

      // 필수 필드 확인
      if (!providerId || !email || !username || !nickname) {
        throw new Error('모든 필드를 입력하세요.')
      }

      // 이메일 중복 확인
      const existingEmailUser = await prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
        },
        select: { userId: true },
      })

      if (existingEmailUser) {
        throw new Error('email_taken')
      }

      // 닉네임 중복 확인
      const existingNicknameUser = await prisma.user.findFirst({
        where: {
          nickname,
          deletedAt: null,
        },
        select: { userId: true },
      })

      if (existingNicknameUser) {
        throw new Error('nickname_taken')
      }

      // 사용자 생성 (userId는 DB 기본값 gen_random_uuid() 적용)
      const newUser = await prisma.user.create({
        data: {
          providerId,
          email,
          username,
          nickname,
          provider: 'kakao',
        },
        select: { userId: true },
      })

      const registrationToken = createRegistrationToken({
        userId: newUser.userId,
        providerId,
      })

      revalidatePath('/login')
      return { userId: newUser.userId, registrationToken }
    },
    { errorMessage: '회원가입에 실패했습니다' }
  )
}
