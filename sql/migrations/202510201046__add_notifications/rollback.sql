-- updated_at 트리거 제거
DROP TRIGGER IF EXISTS trg_notification_updated_at ON notifications;

-- 인덱스 제거
DROP INDEX IF EXISTS idx_notification_active;
DROP INDEX IF EXISTS idx_notification_pinned;
DROP INDEX IF EXISTS idx_notification_author;
DROP INDEX IF EXISTS idx_notification_club;

-- notifications 테이블 제거
DROP TABLE IF EXISTS notifications;

-- 주석: update_updated_at_column 함수는 다른 테이블에서도 사용될 수 있으므로 제거하지 않습니다.
