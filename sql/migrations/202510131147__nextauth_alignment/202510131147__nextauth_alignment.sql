-- Align users table with NextAuth usage and project policies
-- - Switch user_id default from auth.uid() to gen_random_uuid()
-- - Drop username unique index (username duplicates allowed)
-- - Add nickname unique index excluding soft-deleted rows

-- Ensure pgcrypto is available for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) user_id default -> gen_random_uuid()
ALTER TABLE users
  ALTER COLUMN user_id SET DEFAULT gen_random_uuid();

-- 2) Drop username unique index (if exists)
DROP INDEX IF EXISTS uk_user_username_active;

-- 3) Add nickname unique index (soft-delete aware)
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_nickname_active
  ON users (nickname)
  WHERE deleted_at IS NULL;
