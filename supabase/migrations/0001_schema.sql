-- Digitalink SVCET — Database Schema
-- Run this in the Supabase SQL Editor or via supabase CLI

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- DEPARTMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS departments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  code          TEXT NOT NULL UNIQUE,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ACADEMIC YEARS
-- ============================================================================
CREATE TABLE IF NOT EXISTS academic_years (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  start_date    DATE,
  end_date      DATE,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SEMESTERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS semesters (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  semester_number  INTEGER NOT NULL DEFAULT 1,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  display_order    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SUBJECTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS subjects (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id    UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester_id      UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  subject_code     TEXT,
  description      TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- RESOURCE CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS resource_categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description  TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- RESOURCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS resources (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  description      TEXT,
  storage_path     TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  file_extension   TEXT NOT NULL,
  mime_type        TEXT NOT NULL,
  file_size        BIGINT NOT NULL,
  department_id    UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester_id      UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  subject_id       UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  category_id      UUID NOT NULL REFERENCES resource_categories(id) ON DELETE SET NULL,
  uploaded_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approval_status  TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'hidden')),
  visibility       TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'restricted', 'private')),
  tags             TEXT[],
  unit             TEXT,
  language         TEXT,
  version_notes    TEXT,
  reference_source TEXT,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- FACULTY PERMISSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS faculty_permissions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id        UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  can_upload           BOOLEAN NOT NULL DEFAULT true,
  can_create_subjects  BOOLEAN NOT NULL DEFAULT true,
  can_edit_resources   BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (faculty_user_id, department_id)
);

-- ============================================================================
-- BOOKMARKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

-- ============================================================================
-- RESOURCE VIEWS (analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS resource_views (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- APP SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_settings (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_required  BOOLEAN NOT NULL DEFAULT true,
  max_file_size_mb   INTEGER NOT NULL DEFAULT 50,
  allowed_file_types TEXT[] NOT NULL DEFAULT ARRAY['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'xlsx', 'zip'],
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_semesters_academic_year ON semesters(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_resources_department ON resources(department_id);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject_id);
CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by ON resources(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_resources_approval_status ON resources(approval_status);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_views_resource ON resource_views(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at     BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER departments_updated_at  BEFORE UPDATE ON departments  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER academic_years_updated_at BEFORE UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER semesters_updated_at    BEFORE UPDATE ON semesters    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subjects_updated_at     BEFORE UPDATE ON subjects     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER resource_categories_updated_at BEFORE UPDATE ON resource_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER resources_updated_at    BEFORE UPDATE ON resources    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON app_settings  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
