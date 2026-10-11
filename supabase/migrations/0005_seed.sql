-- Digitalink SVCET — Seed Data
-- Run after all other migrations

-- ============================================================================
-- APP SETTINGS (single row)
-- ============================================================================
INSERT INTO app_settings (approval_required, max_file_size_mb, allowed_file_types)
VALUES (true, 50, ARRAY['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'xlsx', 'zip'])
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEPARTMENTS
-- ============================================================================
INSERT INTO departments (name, code, description, is_active, display_order) VALUES
  ('Computer Science Engineering', 'CSE', 'Department of Computer Science & Engineering', true, 0),
  ('Electronics & Communication Engineering', 'ECE', 'Department of Electronics & Communication Engineering', true, 1),
  ('Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering', true, 2),
  ('Electrical & Electronics Engineering', 'EEE', 'Department of Electrical & Electronics Engineering', true, 3),
  ('Civil Engineering', 'CIVIL', 'Department of Civil Engineering', true, 4),
  ('Information Technology', 'IT', 'Department of Information Technology', true, 5),
  ('Artificial Intelligence & Data Science', 'AI&DS', 'Department of AI & Data Science', true, 6)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- ACADEMIC YEARS
-- ============================================================================
INSERT INTO academic_years (name, start_date, end_date, is_active, display_order) VALUES
  ('2023-2024', '2023-07-01', '2024-06-30', false, 0),
  ('2024-2025', '2024-07-01', '2025-06-30', true, 1),
  ('2025-2026', '2025-07-01', '2026-06-30', true, 2)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEMESTERS (for each academic year)
-- ============================================================================
INSERT INTO semesters (academic_year_id, name, semester_number, is_active, display_order)
SELECT ay.id, 'Semester ' || s.num, s.num, true, s.num
FROM academic_years ay
CROSS JOIN generate_series(1, 8) AS s(num)
WHERE ay.is_active = true
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RESOURCE CATEGORIES
-- ============================================================================
INSERT INTO resource_categories (name, description, is_active, display_order) VALUES
  ('Notes', 'Lecture notes and study materials', true, 0),
  ('Question Papers', 'Previous year question papers', true, 1),
  ('Assignments', 'Assignment problems and solutions', true, 2),
  ('Lab Manuals', 'Laboratory manuals and records', true, 3),
  ('Presentations', 'Slides and presentation decks', true, 4),
  ('Reference Books', 'Textbook chapters and reference material', true, 5),
  ('Syllabus', 'Course syllabus and curriculum documents', true, 6)
ON CONFLICT DO NOTHING;
