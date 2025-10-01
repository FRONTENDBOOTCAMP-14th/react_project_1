-- Local schema for PostgreSQL (no Supabase auth schema)
-- PostgreSQL dialect
-- Requires: pgcrypto extension for gen_random_uuid()

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Utility: auto update updated_at on row changes
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* =====================
   USERS (local: gen_random_uuid instead of auth.uid())
   ===================== */
CREATE TABLE IF NOT EXISTS users (
  user_id     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider    varchar     NOT NULL,
  provider_id varchar     NOT NULL,
  email       varchar,
  username    varchar     NOT NULL,
  nickname    varchar,
  created_at  timestamp   NOT NULL DEFAULT now(),
  updated_at  timestamp   NOT NULL DEFAULT now(),
  deleted_at  timestamp
);

-- Soft-delete aware unique constraints (active rows only)
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_provider_active
  ON users (provider, provider_id)
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_email_active
  ON users (email)
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_username_active
  ON users (username)
  WHERE deleted_at IS NULL;

-- Optional supportive indexes
CREATE INDEX IF NOT EXISTS idx_user_provider ON users (provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_user_active ON users (user_id) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

/* =====================
   COMMUNITIES
   ===================== */
CREATE TABLE IF NOT EXISTS communities (
  club_id     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar     NOT NULL,
  description text,
  is_public   boolean     NOT NULL DEFAULT true,
  created_at  timestamp   NOT NULL DEFAULT now(),
  updated_at  timestamp   NOT NULL DEFAULT now(),
  deleted_at  timestamp
);

-- Enforce active-only uniqueness on community name
ALTER TABLE communities DROP CONSTRAINT IF EXISTS uk_community_name;
CREATE UNIQUE INDEX IF NOT EXISTS uk_community_name_active ON communities (name)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_community_public ON communities (is_public);
CREATE INDEX IF NOT EXISTS idx_community_name ON communities (name);
CREATE INDEX IF NOT EXISTS idx_community_active ON communities (name) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_communities_updated_at ON communities;
CREATE TRIGGER trg_communities_updated_at
BEFORE UPDATE ON communities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

/* =====================
   STUDY GOALS
   ===================== */
CREATE TABLE IF NOT EXISTS study_goals (
  goal_id     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid        NOT NULL,
  club_id     uuid,
  title       varchar     NOT NULL,
  description text,
  is_team     boolean     NOT NULL DEFAULT false,
  start_date  date        NOT NULL,
  end_date    date        NOT NULL,
  created_at  timestamp   NOT NULL DEFAULT now(),
  updated_at  timestamp   NOT NULL DEFAULT now(),
  deleted_at  timestamp,
  CONSTRAINT chk_goal_dates CHECK (end_date >= start_date),
  CONSTRAINT fk_goal_owner FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_goal_club FOREIGN KEY (club_id) REFERENCES communities(club_id) ON DELETE SET NULL,
  CONSTRAINT chk_team_goal_club CHECK (
    (is_team = false AND club_id IS NULL) OR (is_team = true AND club_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_goal_owner ON study_goals (owner_id);
CREATE INDEX IF NOT EXISTS idx_goal_dates ON study_goals (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_goal_team ON study_goals (is_team);
CREATE INDEX IF NOT EXISTS idx_goal_owner_team ON study_goals (owner_id, is_team) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_goal_active ON study_goals (owner_id) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_study_goals_updated_at ON study_goals;
CREATE TRIGGER trg_study_goals_updated_at
BEFORE UPDATE ON study_goals
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

/* =====================
   REACTIONS (dependent on STUDY GOALS)
   ===================== */
CREATE TABLE IF NOT EXISTS reactions (
  reaction_id uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL,
  goal_id     uuid        NOT NULL,
  emoji       text        NOT NULL,
  created_at  timestamp   NOT NULL DEFAULT now(),
  deleted_at  timestamp,
  CONSTRAINT uk_reaction_user_goal UNIQUE (user_id, goal_id, emoji),
  CONSTRAINT fk_reaction_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_reaction_goal FOREIGN KEY (goal_id) REFERENCES study_goals(goal_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reaction_goal ON reactions (goal_id);
CREATE INDEX IF NOT EXISTS idx_reaction_user ON reactions (user_id);
CREATE INDEX IF NOT EXISTS idx_reaction_active ON reactions (goal_id) WHERE deleted_at IS NULL;

/* =====================
   COMMUNITY MEMBERS (single PK + partial unique for active pairs)
   ===================== */
CREATE TABLE IF NOT EXISTS community_members (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id    uuid        NOT NULL,
  user_id    uuid        NOT NULL,
  role       varchar     NOT NULL DEFAULT 'member',
  joined_at  timestamp   NOT NULL DEFAULT now(),
  deleted_at timestamp,
  CONSTRAINT fk_member_club FOREIGN KEY (club_id) REFERENCES communities(club_id) ON DELETE CASCADE,
  CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT chk_member_role CHECK (role IN ('admin', 'member'))
);

CREATE INDEX IF NOT EXISTS idx_member_user ON community_members (user_id);
CREATE INDEX IF NOT EXISTS idx_member_club ON community_members (club_id);
CREATE INDEX IF NOT EXISTS idx_member_active ON community_members (club_id) WHERE deleted_at IS NULL;
-- Active rows must be unique on (club_id, user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = ANY (current_schemas(false))
      AND indexname = 'uk_member_active'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX uk_member_active ON community_members (club_id, user_id) WHERE deleted_at IS NULL;';
  END IF;
END$$;
