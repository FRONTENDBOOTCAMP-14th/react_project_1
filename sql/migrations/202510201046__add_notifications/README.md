# Migration: Add Notifications

## Date

2025-10-20 10:46

## Description

커뮤니티별 공지사항(Notification) 기능을 추가합니다. 커뮤니티 관리자가 공지사항을 작성하고 중요 공지를 상단에 고정할 수 있습니다.

## Changes

### 새 테이블: notifications

- `notification_id` (UUID, PK): 공지사항 고유 ID
- `club_id` (UUID, NOT NULL, FK): 소속 커뮤니티 ID
- `author_id` (UUID, nullable, FK): 작성자 ID (작성자 삭제 시 NULL)
- `title` (VARCHAR, NOT NULL): 공지사항 제목
- `content` (TEXT, nullable): 공지사항 내용
- `is_pinned` (BOOLEAN, NOT NULL, DEFAULT false): 상단 고정 여부
- `created_at` (TIMESTAMP(6), NOT NULL): 생성일
- `updated_at` (TIMESTAMP(6), NOT NULL): 수정일
- `deleted_at` (TIMESTAMP(6), nullable): 소프트 삭제 시각

### 제약조건

- `fk_notification_club`: 커뮤니티 삭제 시 공지사항도 함께 삭제 (CASCADE)
- `fk_notification_author`: 작성자 삭제 시 공지사항은 유지 (SET NULL)

### 인덱스

- `idx_notification_club`: 커뮤니티별 공지사항 조회 최적화
- `idx_notification_author`: 작성자별 공지사항 조회 최적화
- `idx_notification_pinned`: 고정 공지사항 우선 정렬 최적화
- `idx_notification_active`: 활성 공지사항 조회 최적화

### 트리거

- `trg_notification_updated_at`: updated_at 자동 갱신 트리거

## Impact

- 기존 데이터: 새 테이블이므로 기존 데이터에 영향 없음
- 애플리케이션: Notification 타입 정의 및 API 엔드포인트 추가 필요

## Usage Example

```sql
-- 공지사항 생성
INSERT INTO notifications (club_id, author_id, title, content, is_pinned)
VALUES (
  'club-uuid-here',
  'author-uuid-here',
  '노트북 대여는 불가합니다',
  '스터디시 개인노트북 지참 부탁드립니다.',
  false
);

-- 커뮤니티의 활성 공지사항 조회 (고정 공지 우선)
SELECT notification_id, title, content, is_pinned, created_at
FROM notifications
WHERE club_id = 'club-uuid-here'
  AND deleted_at IS NULL
ORDER BY is_pinned DESC, created_at DESC;

-- 공지사항 고정/해제
UPDATE notifications
SET is_pinned = true, updated_at = NOW()
WHERE notification_id = 'notification-uuid-here';

-- 공지사항 소프트 삭제
UPDATE notifications
SET deleted_at = NOW()
WHERE notification_id = 'notification-uuid-here';
```

## Rollback

`rollback.sql` 파일을 실행하여 변경사항을 되돌릴 수 있습니다.
