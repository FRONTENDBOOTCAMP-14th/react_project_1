-- 1. 기존 외래 키 제약조건 제거
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS fk_reaction_member;

-- 2. 기존 인덱스 제거
DROP INDEX IF EXISTS idx_reaction_member;

-- 3. 기존 데이터 삭제 (member_id를 goal_id로 매핑할 수 없으므로)
TRUNCATE TABLE reactions;

-- 4. member_id 컬럼을 goal_id로 변경
ALTER TABLE reactions RENAME COLUMN member_id TO goal_id;

-- 5. reaction 컬럼을 emoji로 변경
ALTER TABLE reactions RENAME COLUMN reaction TO emoji;

-- 6. 외래 키 제약조건 복원
ALTER TABLE reactions
ADD CONSTRAINT fk_reaction_goal
FOREIGN KEY (goal_id) REFERENCES study_goals(goal_id)
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- 7. unique 제약조건 복원
ALTER TABLE reactions
ADD CONSTRAINT uk_reaction_user_goal
UNIQUE (user_id, goal_id, emoji);

-- 8. 인덱스 복원
CREATE INDEX idx_reaction_goal ON reactions(goal_id);

-- 9. 테이블 및 컬럼 주석 복원
COMMENT ON TABLE reactions IS '목표에 대한 이모지 리액션';
COMMENT ON COLUMN reactions.reaction_id IS '리액션 고유 ID';
COMMENT ON COLUMN reactions.user_id IS '리액션을 남긴 사용자 ID';
COMMENT ON COLUMN reactions.goal_id IS '리액션 대상 목표 ID';
COMMENT ON COLUMN reactions.emoji IS '이모지 문자열';
COMMENT ON COLUMN reactions.created_at IS '리액션 생성일';
COMMENT ON COLUMN reactions.deleted_at IS '소프트 삭제 시각';
