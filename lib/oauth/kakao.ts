interface TokenResponse {
  access_token: string
  token_type: string
  refresh_token?: string
  expires_in: number
  refresh_token_expires_in?: number
  scope?: string
}

export async function exchangeToken(params: {
  code: string
  clientId: string
  redirectUri: string
  clientSecret?: string
}) {
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
    const t = await res.text()
    throw new Error(`kakao token error: ${res.status} ${t}`)
  }
  const json = (await res.json()) as TokenResponse
  return json
}

export async function getKakaoUserInfo(accessToken: string) {
  const res = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`kakao me error: ${res.status} ${t}`)
  }
  const json = await res.json()
  return json
}
