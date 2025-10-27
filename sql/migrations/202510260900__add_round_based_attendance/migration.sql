CREATE TABLE IF NOT EXISTS attendance (
    attendance_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    round_id uuid NOT NULL,
    attendance_date timestamp NOT NULL,
    attendance_type varchar(16) NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    deleted_at timestamp,

    -- 외래 키 제약조건
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_round FOREIGN KEY (round_id) REFERENCES rounds(round_id) ON DELETE CASCADE,

    -- 한 사용자가 같은 라운드에 중복 출석 체크 방지
    CONSTRAINT uk_attendance_round_user UNIQUE (round_id, user_id),

    -- 출석 타입 제약조건
    CONSTRAINT chk_attendance_type CHECK (attendance_type IN ('present', 'absent', 'late', 'excused'))
);

-- 인덱스 생성
CREATE INDEX idx_attendance_round ON attendance(round_id);
CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, attendance_date DESC);
CREATE INDEX idx_attendance_active ON attendance(round_id, user_id) WHERE deleted_at IS NULL;

-- updated_at 자동 갱신 트리거
DROP TRIGGER IF EXISTS trg_attendance_updated_at ON attendance;
CREATE TRIGGER trg_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 문서화를 위한 테이블 및 컬럼 주석 추가
COMMENT ON TABLE attendance IS '스터디 라운드별 사용자 출석 정보';
COMMENT ON COLUMN attendance.attendance_id IS '출석 고유 ID';
COMMENT ON COLUMN attendance.user_id IS '출석한 사용자 ID';
COMMENT ON COLUMN attendance.round_id IS '출석한 스터디 라운드 ID';
COMMENT ON COLUMN attendance.attendance_date IS '출석 날짜/시간';
COMMENT ON COLUMN attendance.attendance_type IS '출석 타입 (present: 출석, absent: 결석, late: 지각, excused: 양해)';
COMMENT ON COLUMN attendance.created_at IS '출석 기록 생성일';
COMMENT ON COLUMN attendance.updated_at IS '출석 기록 수정일';
COMMENT ON COLUMN attendance.deleted_at IS '소프트 삭제 시각';
