-- 마이그레이션: study_goals에 club_id 일관성 검사 및 자동 동기화 추가
-- 날짜: 2025-10-16 21:32
-- 설명:
--   - 연관된 라운드의 클럽과 club_id가 일치하도록 CHECK 제약 추가
--   - round_id가 설정될 때 club_id를 자동으로 동기화하는 트리거 추가
--   - 조회 성능을 위한 club_id 인덱스 추가

-- ============================================================================
-- 1단계: 더 나은 조회 성능을 위해 club_id에 인덱스 추가
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_goal_club ON study_goals(club_id);

-- ============================================================================
-- 2단계: round로부터 club_id를 동기화하는 함수 생성
-- ============================================================================
CREATE OR REPLACE FUNCTION sync_goal_club_id()
RETURNS TRIGGER AS $$
BEGIN
  -- round_id가 설정되어 있으면 round에서 club_id를 자동으로 설정
  IF NEW.round_id IS NOT NULL THEN
    NEW.club_id := (
      SELECT club_id 
      FROM rounds 
      WHERE round_id = NEW.round_id 
        AND deleted_at IS NULL
    );
    
    -- round를 찾지 못한 경우 오류 발생
    IF NEW.club_id IS NULL THEN
      RAISE EXCEPTION 'Round with round_id % not found or has been deleted', NEW.round_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3단계: club_id 자동 동기화 트리거 생성
-- ============================================================================
DROP TRIGGER IF EXISTS trg_sync_goal_club_id ON study_goals;

CREATE TRIGGER trg_sync_goal_club_id
  BEFORE INSERT OR UPDATE OF round_id ON study_goals
  FOR EACH ROW
  EXECUTE FUNCTION sync_goal_club_id();

-- ============================================================================
-- 4단계: 데이터 일관성 검증 트리거 추가
-- ============================================================================
-- 참고: PostgreSQL의 CHECK 제약조건은 서브쿼리를 허용하지 않으므로
-- 트리거를 통해 일관성을 검증합니다.

CREATE OR REPLACE FUNCTION validate_goal_club_consistency()
RETURNS TRIGGER AS $$
DECLARE
  v_round_club_id UUID;
BEGIN
  -- round_id가 설정된 경우에만 검증
  IF NEW.round_id IS NOT NULL THEN
    -- round의 club_id 조회
    SELECT club_id INTO v_round_club_id
    FROM rounds
    WHERE round_id = NEW.round_id
      AND deleted_at IS NULL;
    
    -- round가 존재하지 않으면 오류
    IF v_round_club_id IS NULL THEN
      RAISE EXCEPTION 'Round with round_id % not found or has been deleted', NEW.round_id;
    END IF;
    
    -- club_id가 round의 club_id와 일치하지 않으면 오류
    IF NEW.club_id IS NOT NULL AND NEW.club_id != v_round_club_id THEN
      RAISE EXCEPTION 'club_id (%) does not match round club_id (%)', NEW.club_id, v_round_club_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_goal_club_consistency ON study_goals;

CREATE TRIGGER trg_validate_goal_club_consistency
  BEFORE INSERT OR UPDATE ON study_goals
  FOR EACH ROW
  EXECUTE FUNCTION validate_goal_club_consistency();

-- ============================================================================
-- 5단계: 기존 데이터 일관성 보정
-- ============================================================================
UPDATE study_goals sg
SET club_id = r.club_id
FROM rounds r
WHERE sg.round_id = r.round_id
  AND sg.round_id IS NOT NULL
  AND (sg.club_id IS NULL OR sg.club_id != r.club_id)
  AND r.deleted_at IS NULL;

-- ============================================================================
-- 6단계: 문서화를 위한 주석 추가
-- ============================================================================
COMMENT ON TRIGGER trg_sync_goal_club_id ON study_goals IS 
  'round_id가 설정되거나 변경될 때 연관된 round로부터 club_id를 자동 동기화';

COMMENT ON FUNCTION sync_goal_club_id() IS 
  'study_goals에서 round_id를 기반으로 club_id를 자동 설정하는 트리거 함수';

COMMENT ON TRIGGER trg_validate_goal_club_consistency ON study_goals IS 
  'club_id와 round의 club_id 일관성을 검증 (round_id가 설정된 경우)';

COMMENT ON FUNCTION validate_goal_club_consistency() IS 
  'study_goals의 club_id가 연관된 round의 club_id와 일치하는지 검증하는 트리거 함수';
