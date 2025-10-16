-- Add rounds table and goal completion tracking
-- - Create rounds table for tracking study rounds
-- - Add round_id foreign key to study_goals
-- - Add is_complete column to study_goals

-- Ensure pgcrypto is available for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Create rounds table
CREATE TABLE IF NOT EXISTS rounds (
  round_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL,
  round_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP(6),
  
  CONSTRAINT fk_round_club 
    FOREIGN KEY (club_id) 
    REFERENCES communities (club_id) 
    ON DELETE CASCADE 
    ON UPDATE NO ACTION
);

-- Add indexes for rounds
CREATE INDEX IF NOT EXISTS idx_round_club ON rounds (club_id);
CREATE INDEX IF NOT EXISTS idx_round_created ON rounds (created_at);
CREATE INDEX IF NOT EXISTS idx_round_active ON rounds (club_id, deleted_at) WHERE deleted_at IS NULL;

-- Add comments for rounds table
COMMENT ON TABLE rounds IS '커뮤니티의 스터디 회차 정보';
COMMENT ON COLUMN rounds.round_id IS '회차 고유 ID';
COMMENT ON COLUMN rounds.club_id IS '커뮤니티 ID';
COMMENT ON COLUMN rounds.round_number IS '회차 번호';
COMMENT ON COLUMN rounds.created_at IS '생성 시각';
COMMENT ON COLUMN rounds.updated_at IS '수정 시각';
COMMENT ON COLUMN rounds.deleted_at IS '삭제 시각 (soft delete)';

-- 2) Add round_id to study_goals
ALTER TABLE study_goals 
  ADD COLUMN IF NOT EXISTS round_id UUID;

-- Add foreign key constraint
ALTER TABLE study_goals
  ADD CONSTRAINT fk_goal_round 
    FOREIGN KEY (round_id) 
    REFERENCES rounds (round_id) 
    ON DELETE SET NULL 
    ON UPDATE NO ACTION;

-- Add index for round_id
CREATE INDEX IF NOT EXISTS idx_goal_round ON study_goals (round_id);

-- 3) Add is_complete to study_goals
ALTER TABLE study_goals 
  ADD COLUMN IF NOT EXISTS is_complete BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for filtering completed goals
CREATE INDEX IF NOT EXISTS idx_goal_complete ON study_goals (is_complete);

-- Add comments
COMMENT ON COLUMN study_goals.round_id IS '소속 회차 ID (nullable)';
COMMENT ON COLUMN study_goals.is_complete IS '목표 완료 여부';