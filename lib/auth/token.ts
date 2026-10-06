import crypto from 'crypto'

export interface RegistrationTokenPayload {
  userId: string
  providerId: string
  expiresAt: number
}

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5분

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET or AUTH_SECRET must be configured')
  }
  return secret
}

/**
 * 회원가입 직후 자동 로그인을 위한 단기 HMAC-SHA256 서명 토큰 생성
 */
export function createRegistrationToken(
  payload: { userId: string; providerId: string },
  ttlMs = DEFAULT_TTL_MS
): string {
  const secret = getSecret()
  const tokenPayload: RegistrationTokenPayload = {
    userId: payload.userId,
    providerId: payload.providerId,
    expiresAt: Date.now() + ttlMs,
  }

  const encodedData = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(encodedData).digest('base64url')

  return `${encodedData}.${signature}`
}

/**
 * 서명 및 유효기간 검증 후 등록 토큰 페이로드 복원
 */
export function verifyRegistrationToken(token: string): RegistrationTokenPayload | null {
  try {
    const secret = getSecret()
    const [encodedData, signature] = token.split('.')
    if (!encodedData || !signature) return null

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(encodedData)
      .digest('base64url')

    const sigBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null
    }

    const payload: RegistrationTokenPayload = JSON.parse(
      Buffer.from(encodedData, 'base64url').toString('utf-8')
    )

    if (typeof payload.expiresAt !== 'number' || Date.now() > payload.expiresAt) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
