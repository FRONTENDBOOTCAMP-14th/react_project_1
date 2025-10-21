-- notifications 테이블 생성
CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL,
  author_id UUID,
  title VARCHAR NOT NULL,
  content TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP(6),
  
  -- 외래 키 제약조건
  CONSTRAINT fk_notification_club 
    FOREIGN KEY (club_id) 
    REFERENCES communities(club_id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_notification_author 
    FOREIGN KEY (author_id) 
    REFERENCES users(user_id) 
    ON DELETE SET NULL
);

-- 인덱스 생성
CREATE INDEX idx_notification_club ON notifications(club_id);
CREATE INDEX idx_notification_author ON notifications(author_id);
CREATE INDEX idx_notification_pinned ON notifications(club_id, is_pinned, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_notification_active ON notifications(club_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- updated_at 자동 갱신 트리거 함수 (기존 함수가 없는 경우에만 생성)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 갱신 트리거
CREATE TRIGGER trg_notification_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 문서화를 위한 테이블 및 컬럼 주석 추가
COMMENT ON TABLE notifications IS '커뮤니티 공지사항';
COMMENT ON COLUMN notifications.notification_id IS '공지사항 고유 ID';
COMMENT ON COLUMN notifications.club_id IS '소속 커뮤니티 ID';
COMMENT ON COLUMN notifications.author_id IS '작성자 ID';
COMMENT ON COLUMN notifications.title IS '공지사항 제목';
COMMENT ON COLUMN notifications.content IS '공지사항 내용';
COMMENT ON COLUMN notifications.is_pinned IS '상단 고정 여부';
COMMENT ON COLUMN notifications.created_at IS '생성일';
COMMENT ON COLUMN notifications.updated_at IS '수정일';
COMMENT ON COLUMN notifications.deleted_at IS '소프트 삭제 시각';
