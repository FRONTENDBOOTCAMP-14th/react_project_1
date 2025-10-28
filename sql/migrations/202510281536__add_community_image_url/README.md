# 마이그레이션: 커뮤니티 이미지 URL 추가

## 개요

커뮤니티 테이블에 대표 이미지 URL을 저장하는 `image_url` 컬럼을 추가합니다.

## 변경 사항

- `communities` 테이블에 `image_url` VARCHAR 컬럼 추가
- Supabase Storage에 업로드된 이미지의 공개 URL을 저장

## 실행 방법

### Supabase (프로덕션)

```bash
# Supabase 대시보드의 SQL Editor에서 migration.sql 실행
```

### 로컬 개발

```bash
# PostgreSQL에 직접 연결하여 실행
psql -h localhost -U postgres -d your_database -f migration.sql
```

## 롤백 방법

```bash
# rollback.sql 실행
psql -h localhost -U postgres -d your_database -f rollback.sql
```

## 관련 파일

- API: `/app/api/upload/image/route.ts`
- 컴포넌트: `/app/community/new/_components/ImageUploader.tsx`
- Prisma 스키마: `/prisma/schema.prisma`

## 주의사항

- 이미지 URL은 선택적(nullable) 필드입니다
- 기존 커뮤니티 데이터는 `image_url`이 NULL로 유지됩니다
- Supabase Storage의 `community-images` bucket이 미리 생성되어 있어야 합니다
