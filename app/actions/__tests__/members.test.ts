import { createMemberAction } from '../members'
import { getCurrentUserId } from '@/lib/auth'

const mockCommunityFindFirst = jest.fn()
const mockCommunityMemberFindFirst = jest.fn()
const mockCommunityMemberCreate = jest.fn()

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    community: {
      findFirst: (...args: unknown[]) => mockCommunityFindFirst(...args),
    },
    communityMember: {
      findFirst: (...args: unknown[]) => mockCommunityMemberFindFirst(...args),
      create: (...args: unknown[]) => mockCommunityMemberCreate(...args),
    },
  },
  default: {
    community: {
      findFirst: (...args: unknown[]) => mockCommunityFindFirst(...args),
    },
    communityMember: {
      findFirst: (...args: unknown[]) => mockCommunityMemberFindFirst(...args),
      create: (...args: unknown[]) => mockCommunityMemberCreate(...args),
    },
  },
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  getCurrentUserId: jest.fn(),
  hasPermission: jest.fn(),
}))

describe('createMemberAction Security Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getCurrentUserId as jest.Mock).mockResolvedValue('user-attacker-id')
  })

  it('클라이언트에서 role: admin을 전달하더라도 반드시 role: member로 등록되어야 한다', async () => {
    mockCommunityFindFirst.mockResolvedValue({ clubId: 'club-1' })
    mockCommunityMemberFindFirst.mockResolvedValue(null)
    mockCommunityMemberCreate.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'member-1', ...data })
    )

    const result = await createMemberAction({
      clubId: 'club-1',
      userId: 'user-attacker-id',
      role: 'admin',
    })

    expect(result.success).toBe(true)
    expect(mockCommunityMemberCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clubId: 'club-1',
        userId: 'user-attacker-id',
        role: 'member',
      }),
    })
  })
})
