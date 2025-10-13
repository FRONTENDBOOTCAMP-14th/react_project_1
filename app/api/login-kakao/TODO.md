# login-kakao TODO

## 1) 사용자 플로우 (User flow)
- **버튼 클릭**: `카카오톡으로 시작하기` 버튼 클릭 (`/login` 페이지)
- **카카오 인증**: 카카오 인증 페이지/앱으로 이동 → `동의하기/가입하기`
- **분기 처리**:
  - **이미 가입됨**: 자체 DB `USERS`에서 `provider='kakao' & provider_id` 존재 → 로그인 처리 → 세션 발급/저장
  - **미가입**: 사용자 정보 입력(이름/닉네임) 페이지로 이동 → 제출 시 회원가입 처리

## 2) API 플로우 (API flow)
- **공통**: 버튼 클릭 → 카카오 SDK 또는 OAuth 리다이렉트 시작 → 인증 완료 후 `authorization_code` 또는 `access_token` 수령

### (A) 가입되지 않은 경우
1. 버튼 클릭 → 카카오 SDK/OAuth 시작
2. 인증 완료 → 서버에서 토큰 교환(`code` → `access_token`, `refresh_token`)
3. `access_token`으로 카카오 API 호출하여 사용자 정보 조회 (소셜 아이디, 이메일)
4. 프런트에서 가입 페이지로 이동(이름/닉네임 입력)
5. 제출 시 서버에 회원가입 요청 → 자체 DB `USERS` 생성(`provider='kakao'`, `provider_id`, `email`, `username`, `nickname`)
6. 가입 완료 후 로그인 상태로 세션 발급/저장, 적절한 페이지로 리다이렉트

### (B) 이미 가입된 경우
1. 버튼 클릭 → 카카오 SDK/OAuth 시작
2. 인증 완료 → 서버에서 토큰 교환
3. 사용자 정보 조회 (소셜 아이디, 이메일)
4. 자체 DB 매칭(`provider='kakao' & provider_id`) → 존재 시 로그인 처리(세션 발급/저장) → 리다이렉트

## 3) 필요한 엔드포인트 (초안)
- **GET `/api/login-kakao/start`**: 카카오 OAuth 시작(리다이렉트 URL 생성 및 이동)
- **GET `/api/login-kakao/callback`**: 카카오로부터 `code` 수신 → 토큰 교환 → 사용자 정보 조회 → 가입/로그인 분기 → 리다이렉트
- **POST `/api/login-kakao/register`**: 미가입 사용자의 최종 회원가입 처리(이름/닉네임 수신) → DB 생성

> App Router 표준에 맞춰 `app/api/login-kakao/{route}/route.ts` 파일로 구현 예정.

## 4) 환경 변수
- `KAKAO_CLIENT_ID` (REST API Key)
- `KAKAO_CLIENT_SECRET` (선택)
- `KAKAO_REDIRECT_URI` (예: `https://<domain>/api/login-kakao/callback`)
- 세션/쿠키 관련: `SESSION_SECRET` 등

## 5) 데이터 매핑 (카카오 → USERS)
- `provider` = `kakao`
- `provider_id` = 카카오 `id`
- `email` = `kakao_account.email` (동의 필요, null 가능) → 가입 시 중복 불가(강제 차단)
- `username` = 정책에 따라 구성(예: `kakao_<id>`) → 중복 허용(유니크 강제하지 않음)
- `nickname` = 가입 페이지 입력값 우선(카카오 닉네임은 검증에 사용하지 않음) → 중복 체크 제공(중복 시 가입 불가)
## 6) DB 고려사항
- 소프트 삭제 유저 제외(이미 인덱스/유니크에 `deleted_at IS NULL` 반영)
- 이메일/유저네임은 활성 사용자 기준으로 유니크 강제. 중복이면 회원가입 진행 금지 및 명확한 에러 메시지 반환
- 닉네임은 유니크 보장은 선택이나, 요구사항에 따라 중복 시 가입 불가 처리. 인덱스/유니크 여부 결정 필요
- 중복 체크 API 추가: `GET /api/login-kakao/check-email?email=...`
- 중복 체크 API 추가: `GET /api/login-kakao/check-username?username=...`
- 회원가입 제출 시 서버 측에서 이메일/유저네임/닉네임 모두 재검증하여 중복 시 가입 차단(원자성 보장)
- 프런트 회원가입 폼에 "중복체크" 버튼 및 실시간 밸리데이션 UX 추가

## 7) 세션/인증 전략
- NextAuth 사용 여부
  - 사용 시: Kakao Provider 설정 → 콜백에서 DB 연결
  - 미사용 시: 자체 세션/쿠키 발급(`HttpOnly` 쿠키에 세션 토큰 저장)

## 8) 에러/예외 처리
- 동의 미완료, 이메일 미제공, 토큰 만료/무효, 네트워크 오류
- 콜백 실패 시 에러 페이지 or 재시도 안내

## 9) QA/테스트 계획
- 로컬 환경에서 카카오 샌드박스/테스트 앱 사용
- 케이스
  - 신규 가입(이메일 제공/미제공)
  - 기존 가입 로그인
  - 동의 거부/취소
  - 콜백에서 오류 파라미터 수신
  - 중복 체크 API: 이메일/닉네임 중복 케이스 (username 제외)

## 10) 작업 체크리스트
- [ ] 라우트 스켈레톤 생성: `start`, `callback`, `register`
- [ ] 카카오 토큰 교환 유틸 작성
- [ ] 카카오 유저 정보 조회 유틸 작성
- [ ] DB 리포지토리 함수: `findByProviderId`, `createUser`
- [ ] 세션 발급/저장 유틸(NextAuth 또는 커스텀)
- [ ] 회원가입 페이지(이름/닉네임 입력) 스캐폴드
- [ ] 성공/에러 리다이렉트 경로 정의
 - [ ] 중복 체크 API 추가: `GET /api/login-kakao/check-email?email=...`
 - [ ] 중복 체크 API 추가: `GET /api/login-kakao/check-username?username=...`
 - [ ] 중복 체크 API 추가: `GET /api/login-kakao/check-nickname?nickname=...`
 - [ ] 회원가입 제출 시 서버 측에서 이메일/유저네임/닉네임 모두 재검증하여 중복 시 가입 차단(원자성 보장)
 - [ ] 프런트 회원가입 폼에 "중복체크" 버튼 및 실시간 밸리데이션 UX 추가
