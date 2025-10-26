# Migration: Add Community Region Fields

## Date

2025-10-26 00:00

## Description

Community 모델에 지역 정보를 저장할 수 있는 `region`과 `subRegion` 필드를 추가합니다. 이를 통해 지역 기반 커뮤니티 검색 및 필터링 기능을 구현할 수 있습니다.

## Changes

### 기존 테이블 수정: communities

- `region` (VARCHAR, nullable): 광역 지역 정보 (예: 서울시, 경기도)
- `subRegion` (VARCHAR, nullable): 세부 지역 정보 (예: 강남구, 성남시)

### 인덱스

- `idx_community_region`: 지역별 커뮤니티 조회 최적화
- `idx_community_subRegion`: 세부 지역별 커뮤니티 조회 최적화

## Impact

- 기존 데이터: 새 컬럼이므로 기존 데이터에 영향 없음 (NULL로 초기화)
- 애플리케이션: Community 타입 정의 업데이트 및 지역 필드 사용 로직 추가 필요
- region.json 데이터와 연동하여 커뮤니티 생성 시 지역 선택 기능 구현 가능

## Usage Example

```sql
-- 특정 지역 커뮤니티 조회
SELECT club_id, name, region, subRegion
FROM communities
WHERE region = '서울시'
  AND deleted_at IS NULL
ORDER BY created_at DESC;

-- 지역과 세부 지역으로 필터링
SELECT club_id, name, region, subRegion
FROM communities
WHERE region = '경기도'
  AND subRegion = '성남시'
  AND deleted_at IS NULL;

-- 커뮤니티 생성 시 지역 정보 포함
INSERT INTO communities (name, description, region, subRegion, is_public)
VALUES (
  '성남 코딩 스터디',
  '성남 지역 개발자 모임입니다.',
  '경기도',
  '성남시',
  true
);
```

## Rollback

`rollback.sql` 파일을 실행하여 region, subRegion 컬럼을 제거할 수 있습니다.
