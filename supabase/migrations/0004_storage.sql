-- Digitalink SVCET — Storage Setup
-- Run in Supabase SQL Editor after schema migrations

-- Create private storage bucket for resources
-- Files are NOT publicly accessible; access via signed URLs only
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Faculty can upload to resources bucket
CREATE POLICY "Faculty can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resources'
    AND is_faculty()
  );

-- Admins can upload files
CREATE POLICY "Admins can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resources'
    AND is_admin()
  );

-- Users can read files they uploaded
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resources'
    AND owner = auth.uid()
  );

-- Admins can read all files
CREATE POLICY "Admins can read all files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resources'
    AND is_admin()
  );

-- Faculty can delete their own files
CREATE POLICY "Faculty can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resources'
    AND owner = auth.uid()
  );

-- Admins can delete any file
CREATE POLICY "Admins can delete files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resources'
    AND is_admin()
  );
