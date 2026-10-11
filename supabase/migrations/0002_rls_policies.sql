-- Digitalink SVCET — Row Level Security Policies
-- Run after 0001_schema.sql

-- Enable RLS on all tables
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years      ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources           ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_views      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings        ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if current user is faculty
CREATE OR REPLACE FUNCTION is_faculty()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'faculty' AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- PROFILES
-- ============================================================================
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- DEPARTMENTS (read: all authenticated; write: admin only)
-- ============================================================================
CREATE POLICY "Authenticated can read departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage departments"
  ON departments FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- ACADEMIC YEARS
-- ============================================================================
CREATE POLICY "Authenticated can read academic years"
  ON academic_years FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage academic years"
  ON academic_years FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- SEMESTERS
-- ============================================================================
CREATE POLICY "Authenticated can read semesters"
  ON semesters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage semesters"
  ON semesters FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- SUBJECTS
-- ============================================================================
CREATE POLICY "Authenticated can read active subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage subjects"
  ON subjects FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Faculty with permission can create subjects
CREATE POLICY "Faculty can create subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (
    is_faculty() AND EXISTS (
      SELECT 1 FROM faculty_permissions fp
      WHERE fp.faculty_user_id = auth.uid()
        AND fp.department_id = NEW.department_id
        AND fp.can_create_subjects = true
    )
  );

-- ============================================================================
-- RESOURCE CATEGORIES
-- ============================================================================
CREATE POLICY "Authenticated can read categories"
  ON resource_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON resource_categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- RESOURCES
-- ============================================================================
-- Students can read approved public resources
CREATE POLICY "Students can read approved resources"
  ON resources FOR SELECT
  TO authenticated
  USING (
    approval_status = 'approved'
    AND visibility IN ('public', 'restricted')
  );

-- Faculty can read their own resources (any status)
CREATE POLICY "Faculty can read own resources"
  ON resources FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Admins can read all resources
CREATE POLICY "Admins can read all resources"
  ON resources FOR SELECT
  TO authenticated
  USING (is_admin());

-- Faculty with permission can insert resources
CREATE POLICY "Faculty can upload resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (
    is_faculty() AND EXISTS (
      SELECT 1 FROM faculty_permissions fp
      WHERE fp.faculty_user_id = auth.uid()
        AND fp.department_id = NEW.department_id
        AND fp.can_upload = true
    )
  );

-- Faculty can update own resources (metadata only)
CREATE POLICY "Faculty can update own resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM faculty_permissions fp
      WHERE fp.faculty_user_id = auth.uid()
        AND fp.department_id = resources.department_id
        AND fp.can_edit_resources = true
    )
  );

-- Admins can manage all resources
CREATE POLICY "Admins can manage resources"
  ON resources FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- FACULTY PERMISSIONS
-- ============================================================================
-- Faculty can read their own permissions
CREATE POLICY "Faculty can read own permissions"
  ON faculty_permissions FOR SELECT
  TO authenticated
  USING (faculty_user_id = auth.uid());

-- Admins can manage all permissions
CREATE POLICY "Admins can manage permissions"
  ON faculty_permissions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- BOOKMARKS
-- ============================================================================
CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- RESOURCE VIEWS
-- ============================================================================
CREATE POLICY "Users can insert own views"
  ON resource_views FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all views"
  ON resource_views FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- APP SETTINGS
-- ============================================================================
CREATE POLICY "Authenticated can read settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON app_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
