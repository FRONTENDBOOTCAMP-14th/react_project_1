import { tryCatchAsync, type AsyncResult } from '@/lib/errors/result'

interface TokenResponse {
  access_token: string
  token_type: string
  refresh_token?: string
  expires_in: number
  refresh_token_expires_in?: number
  scope?: string
}

export interface KakaoError {
  type: 'network' | 'auth_failed' | 'invalid_response' | 'unknown'
  message: string
  statusCode?: number
  details?: string
}

/**
 * 카카오 인증 코드로 액세스 토큰 교환
 * @param params - 인증 코드 및 클라이언트 정보
 * @returns Result<TokenResponse, KakaoError>
 */
export async function exchangeToken(params: {
  code: string
  clientId: string
  redirectUri: string
  clientSecret?: string
}): AsyncResult<TokenResponse, KakaoError> {
  return tryCatchAsync(
    async () => {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: params.clientId,
        redirect_uri: params.redirectUri,
        code: params.code,
      })
      if (params.clientSecret) body.set('client_secret', params.clientSecret)

      const res = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
        body,
        cache: 'no-store',
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw {
          statusCode: res.status,
          details: errorText,
        }
      }

      const json = (await res.json()) as TokenResponse
      return json
    },
    (error): KakaoError => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        const err = error as { statusCode: number; details: string }
        return {
          type: err.statusCode === 401 || err.statusCode === 400 ? 'auth_failed' : 'network',
          message: '카카오 토큰 교환에 실패했습니다',
          statusCode: err.statusCode,
          details: err.details,
        }
      }
      return {
        type: 'unknown',
        message: '카카오 토큰 교환 중 알 수 없는 오류가 발생했습니다',
        details: String(error),
      }
    }
  )
}

/**
 * 카카오 액세스 토큰으로 사용자 정보 조회
 * @param accessToken - 카카오 액세스 토큰
 * @returns Result<카카오 사용자 정보, KakaoError>
 */
export async function getKakaoUserInfo(
  accessToken: string
): AsyncResult<KakaoUserInfo, KakaoError> {
  return tryCatchAsync(
    async () => {
      const res = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw {
          statusCode: res.status,
          details: errorText,
        }
      }

      const json = await res.json()
      return json as KakaoUserInfo
    },
    (error): KakaoError => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        const err = error as { statusCode: number; details: string }
        return {
          type: err.statusCode === 401 ? 'auth_failed' : 'network',
          message: '카카오 사용자 정보 조회에 실패했습니다',
          statusCode: err.statusCode,
          details: err.details,
        }
      }
      return {
        type: 'unknown',
        message: '카카오 사용자 정보 조회 중 알 수 없는 오류가 발생했습니다',
        details: String(error),
      }
    }
  )
}

/**
 * 카카오 사용자 정보 타입
 */
export interface KakaoUserInfo {
  id: number
  kakao_account?: {
    email?: string
    profile?: {
      nickname?: string
      profile_image_url?: string
    }
  }
}
