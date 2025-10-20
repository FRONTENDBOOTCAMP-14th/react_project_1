# Notifications API

커뮤니티 공지사항을 관리하는 REST API 엔드포인트입니다.

## 엔드포인트 목록

### 1. 공지사항 목록 조회

**GET** `/api/notifications`

커뮤니티의 공지사항 목록을 조회합니다. 고정 공지사항이 먼저 표시되고, 그 다음 최신순으로 정렬됩니다.

#### Query Parameters

| 파라미터 | 타입    | 필수 | 설명                      |
| -------- | ------- | ---- | ------------------------- |
| clubId   | string  | ✅   | 커뮤니티 ID               |
| isPinned | boolean | ❌   | 고정 공지사항만 조회      |
| page     | number  | ❌   | 페이지 번호 (기본값: 1)   |
| limit    | number  | ❌   | 페이지당 개수 (기본값: 20) |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "notificationId": "uuid",
      "clubId": "uuid",
      "authorId": "uuid",
      "title": "노트북 대여는 불가합니다",
      "content": "스터디시 개인노트북 지참 부탁드립니다.",
      "isPinned": true,
      "createdAt": "2025-10-20T10:00:00Z",
      "updatedAt": "2025-10-20T10:00:00Z"
    }
  ],
  "count": 1,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### 사용 예제

```typescript
// 커뮤니티의 모든 공지사항 조회
const response = await fetch('/api/notifications?clubId=club-uuid-here')
const data = await response.json()

// 고정 공지사항만 조회
const pinnedResponse = await fetch(
  '/api/notifications?clubId=club-uuid-here&isPinned=true'
)

// 페이지네이션
const pageResponse = await fetch(
  '/api/notifications?clubId=club-uuid-here&page=2&limit=10'
)
```

---

### 2. 공지사항 생성

**POST** `/api/notifications`

새로운 공지사항을 생성합니다.

#### Request Body

```json
{
  "clubId": "uuid",
  "authorId": "uuid",
  "title": "공지사항 제목",
  "content": "공지사항 내용",
  "isPinned": false
}
```

| 필드     | 타입    | 필수 | 설명                             |
| -------- | ------- | ---- | -------------------------------- |
| clubId   | string  | ✅   | 커뮤니티 ID                      |
| authorId | string  | ✅   | 작성자 ID                        |
| title    | string  | ✅   | 공지사항 제목                    |
| content  | string  | ❌   | 공지사항 내용                    |
| isPinned | boolean | ❌   | 상단 고정 여부 (기본값: false)   |

#### Response

```json
{
  "success": true,
  "data": {
    "notificationId": "uuid",
    "clubId": "uuid",
    "authorId": "uuid",
    "title": "공지사항 제목",
    "content": "공지사항 내용",
    "isPinned": false,
    "createdAt": "2025-10-20T10:00:00Z",
    "updatedAt": "2025-10-20T10:00:00Z"
  }
}
```

#### 사용 예제

```typescript
const response = await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clubId: 'club-uuid-here',
    authorId: 'user-uuid-here',
    title: '노트북 대여는 불가합니다',
    content: '스터디시 개인노트북 지참 부탁드립니다.',
    isPinned: true,
  }),
})
const data = await response.json()
```

---

### 3. 공지사항 상세 조회

**GET** `/api/notifications/[id]`

특정 공지사항의 상세 정보를 조회합니다. 작성자와 커뮤니티 정보를 포함합니다.

#### Response

```json
{
  "success": true,
  "data": {
    "notificationId": "uuid",
    "clubId": "uuid",
    "authorId": "uuid",
    "title": "공지사항 제목",
    "content": "공지사항 내용",
    "isPinned": false,
    "createdAt": "2025-10-20T10:00:00Z",
    "updatedAt": "2025-10-20T10:00:00Z",
    "community": {
      "clubId": "uuid",
      "name": "커뮤니티 이름"
    },
    "author": {
      "userId": "uuid",
      "username": "사용자명"
    }
  }
}
```

#### 사용 예제

```typescript
const response = await fetch('/api/notifications/notification-uuid-here')
const data = await response.json()
```

---

### 4. 공지사항 수정

**PATCH** `/api/notifications/[id]`

특정 공지사항을 수정합니다. 제공된 필드만 업데이트됩니다.

#### Request Body

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "isPinned": true
}
```

모든 필드는 선택적(optional)입니다.

#### Response

```json
{
  "success": true,
  "data": {
    "notificationId": "uuid",
    "clubId": "uuid",
    "authorId": "uuid",
    "title": "수정된 제목",
    "content": "수정된 내용",
    "isPinned": true,
    "createdAt": "2025-10-20T10:00:00Z",
    "updatedAt": "2025-10-20T11:00:00Z"
  }
}
```

#### 사용 예제

```typescript
// 공지사항 고정/해제
const response = await fetch('/api/notifications/notification-uuid-here', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ isPinned: true }),
})

// 제목과 내용 수정
const updateResponse = await fetch('/api/notifications/notification-uuid-here', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: '수정된 제목',
    content: '수정된 내용',
  }),
})
```

---

### 5. 공지사항 삭제

**DELETE** `/api/notifications/[id]`

특정 공지사항을 소프트 삭제합니다. 실제 데이터는 유지되지만 목록에서 제외됩니다.

#### Response

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

#### 사용 예제

```typescript
const response = await fetch('/api/notifications/notification-uuid-here', {
  method: 'DELETE',
})
const data = await response.json()
```

---

## 에러 응답

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "success": false,
  "error": "에러 메시지",
  "message": "상세 에러 정보 (선택적)"
}
```

### HTTP 상태 코드

- `200` - 성공 (GET)
- `201` - 생성 성공 (POST)
- `400` - 잘못된 요청 (필수 필드 누락, 유효성 검증 실패)
- `404` - 리소스를 찾을 수 없음
- `500` - 서버 에러

---

## 주요 특징

- ✅ **소프트 삭제**: 삭제된 데이터는 `deletedAt` 필드로 관리되며 복구 가능
- ✅ **페이지네이션**: 대량의 공지사항을 효율적으로 조회
- ✅ **고정 공지사항**: 중요한 공지를 상단에 고정 가능
- ✅ **정렬 최적화**: 고정 공지 우선 → 최신순 자동 정렬
- ✅ **관계 데이터**: 작성자와 커뮤니티 정보 포함 조회 가능
