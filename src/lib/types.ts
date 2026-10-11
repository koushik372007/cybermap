export type UserRole = 'student' | 'faculty' | 'admin'
export type UserStatus = 'active' | 'suspended' | 'pending'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'hidden'
export type ResourceVisibility = 'public' | 'restricted' | 'private'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  code: string
  description: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface AcademicYear {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Semester {
  id: string
  academic_year_id: string
  name: string
  semester_number: number
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  department_id: string
  academic_year_id: string
  semester_id: string
  name: string
  subject_code: string | null
  description: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ResourceCategory {
  id: string
  name: string
  description: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  title: string
  description: string | null
  storage_path: string
  original_file_name: string
  file_extension: string
  mime_type: string
  file_size: number
  department_id: string
  academic_year_id: string
  semester_id: string
  subject_id: string
  category_id: string
  uploaded_by: string
  approval_status: ApprovalStatus
  visibility: ResourceVisibility
  tags: string[] | null
  unit: string | null
  language: string | null
  version_notes: string | null
  reference_source: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  // Joined relations
  department?: Department
  academic_year?: AcademicYear
  semester?: Semester
  subject?: Subject
  category?: ResourceCategory
  uploader?: Profile
}

export interface FacultyPermission {
  id: string
  faculty_user_id: string
  department_id: string
  can_upload: boolean
  can_create_subjects: boolean
  can_edit_resources: boolean
  created_at: string
  department?: Department
  faculty?: Profile
}

export interface Bookmark {
  id: string
  user_id: string
  resource_id: string
  created_at: string
  resource?: Resource
}

export interface AuditLog {
  id: string
  actor_user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  actor?: Profile
}

export interface AppSettings {
  id: string
  approval_required: boolean
  max_file_size_mb: number
  allowed_file_types: string[]
  created_at: string
  updated_at: string
}
