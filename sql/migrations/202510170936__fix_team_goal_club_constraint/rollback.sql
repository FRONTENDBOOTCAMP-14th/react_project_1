-- 롤백: chk_team_goal_club 제약조건 수정 취소
-- 날짜: 2025-10-17 09:36

-- ============================================================================
-- 제약조건 원래대로 복원
-- ============================================================================

-- 수정된 제약조건 제거
ALTER TABLE study_goals DROP CONSTRAINT IF EXISTS chk_team_goal_club;

-- 원래 제약조건 복원 (개인 목표는 club_id가 NULL이어야 함)
ALTER TABLE study_goals
ADD CONSTRAINT chk_team_goal_club
CHECK (
  (is_team = false AND club_id IS NULL) OR
  (is_team = true AND club_id IS NOT NULL)
);

-- ============================================================================
-- 문서화
-- ============================================================================
COMMENT ON CONSTRAINT chk_team_goal_club ON study_goals IS
  '개인 목표는 club_id가 NULL이어야 하고 그룹 목표는 club_id가 있어야 함';
