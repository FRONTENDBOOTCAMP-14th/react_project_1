-- 1. 기존 reactions 테이블의 데이터 백업 (필요시)
-- CREATE TABLE reactions_backup AS SELECT * FROM reactions;

-- 2. 기존 외래 키 제약조건 제거
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS fk_reaction_goal;

-- 3. 기존 unique 제약조건 제거
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS uk_reaction_user_goal;

-- 4. 기존 인덱스 제거
DROP INDEX IF EXISTS idx_reaction_goal;

-- 5. 기존 데이터 삭제 (goal_id를 member_id로 매핑할 수 없으므로)
TRUNCATE TABLE reactions;

-- 6. goal_id 컬럼을 member_id로 변경
ALTER TABLE reactions RENAME COLUMN goal_id TO member_id;

-- 7. emoji 컬럼을 reaction으로 변경
ALTER TABLE reactions RENAME COLUMN emoji TO reaction;

-- 8. 새 외래 키 제약조건 추가
ALTER TABLE reactions
ADD CONSTRAINT fk_reaction_member
FOREIGN KEY (member_id) REFERENCES community_members(id)
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- 9. 새 인덱스 생성
CREATE INDEX idx_reaction_member ON reactions(member_id);

-- 10. 테이블 및 컬럼 주석 업데이트
COMMENT ON TABLE reactions IS '멤버에 대한 리액션 및 댓글';
COMMENT ON COLUMN reactions.reaction_id IS '리액션 고유 ID';
COMMENT ON COLUMN reactions.user_id IS '리액션을 남긴 사용자 ID';
COMMENT ON COLUMN reactions.member_id IS '리액션 대상 멤버 ID';
COMMENT ON COLUMN reactions.reaction IS '리액션 내용 (이모지 또는 댓글 텍스트)';
COMMENT ON COLUMN reactions.created_at IS '리액션 생성일';
COMMENT ON COLUMN reactions.deleted_at IS '소프트 삭제 시각';
