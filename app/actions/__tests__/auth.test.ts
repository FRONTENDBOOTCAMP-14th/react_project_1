import { checkEmailAction, checkNicknameAction, registerAction } from '../auth'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  getCurrentUserId: jest.fn(),
}))

jest.mock('@/lib/auth/token', () => ({
  createRegistrationToken: jest.fn(() => 'mock-registration-token'),
}))

jest.mock('@/lib/prisma', () => {
  const client = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  }
  return {
    __esModule: true,
    prisma: client,
    default: client,
  }
})

describe('Auth Server Actions for Unauthenticated Visitors', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getCurrentUserId as jest.Mock).mockResolvedValue(null) // 세션 없는 미인증 상태
  })

  it('미인증 상태에서도 checkEmailAction이 인증 에러 없이 이메일 중복 검사를 수행해야 한다', async () => {
    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)

    const result = await checkEmailAction({ email: 'newuser@example.com' })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ available: true })
    expect(result.error).toBeUndefined()
  })

  it('미인증 상태에서도 checkNicknameAction이 인증 에러 없이 닉네임 중복 검사를 수행해야 한다', async () => {
    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)

    const result = await checkNicknameAction({ nickname: '신규토끼' })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ available: true })
    expect(result.error).toBeUndefined()
  })

  it('미인증 상태에서도 registerAction이 인증 에러 없이 회원 생성을 수행해야 한다', async () => {
    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue({
      userId: '11111111-2222-3333-4444-555555555555',
    })

    const result = await registerAction({
      providerId: 'kakao-12345',
      email: 'newuser@example.com',
      username: '홍길동',
      nickname: '길동토끼',
    })

    expect(result.success).toBe(true)
    expect(result.data?.userId).toBe('11111111-2222-3333-4444-555555555555')
    expect(result.error).toBeUndefined()
  })
})
