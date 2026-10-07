import { createRegistrationToken, verifyRegistrationToken } from '../token'

describe('Registration Token Security', () => {
  const secret = 'test-secret-key-for-hmac'
  const originalSecret = process.env.NEXTAUTH_SECRET

  beforeAll(() => {
    process.env.NEXTAUTH_SECRET = secret
  })

  afterAll(() => {
    process.env.NEXTAUTH_SECRET = originalSecret
  })

  it('발급된 등록 토큰을 정상적으로 검증하고 페이로드를 복원해야 함', () => {
    const payload = {
      userId: '7f9d8a12-8822-4876-b6d4-8848dbba7421',
      providerId: '3812948192',
    }
    const token = createRegistrationToken(payload)
    expect(typeof token).toBe('string')

    const verified = verifyRegistrationToken(token)
    expect(verified).not.toBeNull()
    expect(verified?.userId).toBe(payload.userId)
    expect(verified?.providerId).toBe(payload.providerId)
  })

  it('위조되거나 변조된 토큰은 검증에 실패해야 함', () => {
    const payload = {
      userId: '7f9d8a12-8822-4876-b6d4-8848dbba7421',
      providerId: '3812948192',
    }
    const token = createRegistrationToken(payload)
    const tampered = token.slice(0, -5) + 'abcde'

    expect(verifyRegistrationToken(tampered)).toBeNull()
  })

  it('만료된 토큰은 검증에 실패해야 함', () => {
    const payload = {
      userId: '7f9d8a12-8822-4876-b6d4-8848dbba7421',
      providerId: '3812948192',
    }
    // ttlMs를 음수로 주어 즉시 만료
    const token = createRegistrationToken(payload, -1000)
    expect(verifyRegistrationToken(token)).toBeNull()
  })
})
