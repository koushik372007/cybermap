import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../components/Toast'
import Modal from '../../components/Modal'
import type { Department, AcademicYear, Semester, Subject, ResourceCategory, FacultyPermission, AppSettings } from '../../lib/types'
import { Upload, FileUp, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

const DEFAULT_ALLOWED = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'xlsx', 'zip']

export default function StaffUpload() {
  const { profile } = useAuth()
  const { toast } = useToast()

  const [departments, setDepartments] = useState<Department[]>([])
  const [years, setYears] = useState<AcademicYear[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [permissions, setPermissions] = useState<FacultyPermission[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [departmentId, setDepartmentId] = useState('')
  const [yearId, setYearId] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [unit, setUnit] = useState('')
  const [language, setLanguage] = useState('')
  const [versionNotes, setVersionNotes] = useState('')
  const [referenceSource, setReferenceSource] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Subject creation modal
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectCode, setNewSubjectCode] = useState('')
  const [newSubjectDesc, setNewSubjectDesc] = useState('')
  const [creatingSubject, setCreatingSubject] = useState(false)

  const load = useCallback(async () => {
    if (!profile?.id) return
    const [resDept, resYear, resCat, resPerm, resSettings] = await Promise.all([
      supabase.from('departments').select('*').eq('is_active', true).order('display_order'),
      supabase.from('academic_years').select('*').eq('is_active', true).order('display_order'),
      supabase.from('resource_categories').select('*').eq('is_active', true).order('display_order'),
      supabase.from('faculty_department_permissions').select('*, department:departments(*)').eq('faculty_user_id', profile.id),
      supabase.from('app_settings').select('*').limit(1).single(),
    ])

    const perms = (resPerm.data ?? []) as FacultyPermission[]
    setPermissions(perms)
    setDepartments((resDept.data ?? []) as Department[])
    setYears((resYear.data ?? []) as AcademicYear[])
    setCategories((resCat.data ?? []) as ResourceCategory[])
    if (resSettings.data) setSettings(resSettings.data as AppSettings)
    setLoading(false)
  }, [profile?.id])

  useEffect(() => { load() }, [load])

  // Filter departments by permission
  const authorizedDeptIds = new Set(permissions.filter((p) => p.can_upload).map((p) => p.department_id))
  const allowedDepartments = departments.filter((d) => authorizedDeptIds.has(d.id))

  // Load semesters when year changes
  useEffect(() => {
    if (!yearId) { setSemesters([]); return }
    supabase.from('semesters').select('*').eq('academic_year_id', yearId).eq('is_active', true).order('display_order')
      .then(({ data }) => setSemesters((data ?? []) as Semester[]))
    setSemesterId('')
    setSubjects([])
    setSubjectId('')
  }, [yearId])

  // Load subjects when department/semester changes
  useEffect(() => {
    if (!departmentId || !semesterId) { setSubjects([]); return }
    supabase.from('subjects').select('*')
      .eq('department_id', departmentId)
      .eq('semester_id', semesterId)
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => setSubjects((data ?? []) as Subject[]))
    setSubjectId('')
  }, [departmentId, semesterId])

  const canCreateSubjects = permissions.some(
    (p) => p.department_id === departmentId && p.can_create_subjects
  )

  const maxSizeMB = settings?.max_file_size_mb ?? 50
  const allowedTypes = settings?.allowed_file_types ?? DEFAULT_ALLOWED

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
    if (!allowedTypes.includes(ext)) {
      toast(`File type .${ext} is not allowed. Allowed: ${allowedTypes.join(', ')}`, 'error')
      return
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      toast(`File exceeds maximum size of ${maxSizeMB}MB`, 'error')
      return
    }
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''))
  }

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim() || !departmentId || !yearId || !semesterId) return
    setCreatingSubject(true)

    // Check duplicate
    const { data: existing } = await supabase.from('subjects')
      .select('id')
      .eq('department_id', departmentId)
      .eq('semester_id', semesterId)
      .ilike('name', newSubjectName.trim())
      .maybeSingle()

    if (existing) {
      toast('A subject with this name already exists in this semester.', 'error')
      setCreatingSubject(false)
      return
    }

    const { data, error } = await supabase.from('subjects').insert({
      name: newSubjectName.trim(),
      subject_code: newSubjectCode.trim() || null,
      description: newSubjectDesc.trim() || null,
      department_id: departmentId,
      academic_year_id: yearId,
      semester_id: semesterId,
      is_active: true,
      created_by: profile?.id,
    }).select().single()

    if (error) {
      toast(error.message, 'error')
      setCreatingSubject(false)
      return
    }

    setSubjects((prev) => [...prev, data as Subject].sort((a, b) => a.name.localeCompare(b.name)))
    setSubjectId(data.id)
    toast('Subject created successfully!', 'success')
    setShowSubjectModal(false)
    setNewSubjectName('')
    setNewSubjectCode('')
    setNewSubjectDesc('')
    setCreatingSubject(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title || !departmentId || !yearId || !semesterId || !subjectId || !categoryId) {
      toast('Please fill in all required fields.', 'error')
      return
    }

    // Verify permission
    const perm = permissions.find((p) => p.department_id === departmentId)
    if (!perm || !perm.can_upload) {
      toast('You do not have upload permission for this department.', 'error')
      return
    }

    setUploading(true)
    setProgress(0)

    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const storagePath = `${departmentId}/${yearId}/${semesterId}/${subjectId}/${Date.now()}-${file.name}`

    try {
      // Upload file to private storage
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(storagePath, file)

      if (uploadError) throw uploadError

      // Save resource metadata
      const { error: dbError } = await supabase.from('resources').insert({
        title,
        description: description || null,
        storage_path: storagePath,
        original_file_name: file.name,
        file_extension: ext,
        mime_type: file.type,
        file_size: file.size,
        department_id: departmentId,
        academic_year_id: yearId,
        semester_id: semesterId,
        subject_id: subjectId,
        category_id: categoryId,
        uploaded_by: profile?.id,
        approval_status: settings?.approval_required ? 'pending' : 'approved',
        visibility,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
        unit: unit || null,
        language: language || null,
        version_notes: versionNotes || null,
        reference_source: referenceSource || null,
      })

      if (dbError) {
        // Clean up uploaded file if metadata save fails
        await supabase.storage.from('resources').remove([storagePath])
        throw dbError
      }

      toast('Resource uploaded successfully!', 'success')
      // Reset form
      setTitle('')
      setDescription('')
      setTags('')
      setUnit('')
      setLanguage('')
      setVersionNotes('')
      setReferenceSource('')
      setFile(null)
      setProgress(0)
    } catch (err: any) {
      toast(err.message || 'Upload failed. Please try again.', 'error')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <DashboardLayout title="Upload Resource"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Upload Resource">
      {allowedDepartments.length === 0 ? (
        <div className="card p-6 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">No Upload Permissions</h3>
          <p className="text-sm text-slate-500">You don't have upload permissions for any department. Contact the administrator.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {/* File upload */}
          <div className="card p-5">
            <label className="label">File <span className="text-red-500">*</span></label>
            {!file ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-navy-400 transition-colors">
                <FileUp className="w-10 h-10 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600">Click to select a file</p>
                <p className="text-xs text-slate-400 mt-1">Max {maxSizeMB}MB · {allowedTypes.join(', ')}</p>
                <input type="file" className="hidden" onChange={handleFileChange} accept={allowedTypes.map((t) => `.${t}`).join(',')} />
              </label>
            ) : (
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            {uploading && (
              <div className="mt-3">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-navy-600 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1 text-center">{progress}%</p>
              </div>
            )}
          </div>

          {/* Required fields */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-navy-900">Required Information</h3>

            <div>
              <label className="label">Resource Title <span className="text-red-500">*</span></label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Enter resource title" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Department <span className="text-red-500">*</span></label>
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required className="input">
                  <option value="">Select department</option>
                  {allowedDepartments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Academic Year <span className="text-red-500">*</span></label>
                <select value={yearId} onChange={(e) => setYearId(e.target.value)} required className="input" disabled={!departmentId}>
                  <option value="">Select year</option>
                  {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Semester <span className="text-red-500">*</span></label>
                <select value={semesterId} onChange={(e) => setSemesterId(e.target.value)} required className="input" disabled={!yearId}>
                  <option value="">Select semester</option>
                  {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Subject <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required className="input flex-1" disabled={!semesterId}>
                    <option value="">Select subject</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}{s.subject_code ? ` (${s.subject_code})` : ''}</option>)}
                  </select>
                  {canCreateSubjects && (
                    <button
                      type="button"
                      onClick={() => setShowSubjectModal(true)}
                      className="btn-secondary whitespace-nowrap"
                      disabled={!departmentId || !yearId || !semesterId}
                    >
                      <Plus className="w-4 h-4" /> New
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="label">Resource Category <span className="text-red-500">*</span></label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="input">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Optional fields */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-navy-900">Optional Information</h3>

            <div>
              <label className="label">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[80px]" placeholder="Describe the resource…" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Tags (comma-separated)</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="input" placeholder="notes, important, exam" />
              </div>
              <div>
                <label className="label">Unit / Module</label>
                <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} className="input" placeholder="Unit 1, Module 2" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Language</label>
                <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} className="input" placeholder="English" />
              </div>
              <div>
                <label className="label">Version Notes</label>
                <input type="text" value={versionNotes} onChange={(e) => setVersionNotes(e.target.value)} className="input" placeholder="v1, revised" />
              </div>
            </div>

            <div>
              <label className="label">Academic Source / Reference</label>
              <input type="text" value={referenceSource} onChange={(e) => setReferenceSource(e.target.value)} className="input" placeholder="Textbook, author, etc." />
            </div>

            <div>
              <label className="label">Visibility</label>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="input">
                <option value="public">Public — visible to all students</option>
                <option value="restricted">Restricted — visible to enrolled students</option>
                <option value="private">Private — admin and uploader only</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={uploading} className="btn-primary w-full">
            {uploading ? `Uploading… ${progress}%` : <><Upload className="w-4 h-4" /> Upload Resource</>}
          </button>
        </form>
      )}

      {/* Create Subject Modal */}
      <Modal open={showSubjectModal} onClose={() => setShowSubjectModal(false)} title="Create New Subject">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
            <p><strong>Department:</strong> {allowedDepartments.find((d) => d.id === departmentId)?.name}</p>
            <p><strong>Year:</strong> {years.find((y) => y.id === yearId)?.name}</p>
            <p><strong>Semester:</strong> {semesters.find((s) => s.id === semesterId)?.name}</p>
          </div>

          <div>
            <label className="label">Subject Name <span className="text-red-500">*</span></label>
            <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} className="input" placeholder="e.g., Data Structures" />
          </div>
          <div>
            <label className="label">Subject Code (optional)</label>
            <input type="text" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} className="input" placeholder="e.g., CS201" />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea value={newSubjectDesc} onChange={(e) => setNewSubjectDesc(e.target.value)} className="input min-h-[60px]" placeholder="Brief description…" />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowSubjectModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreateSubject} disabled={creatingSubject || !newSubjectName.trim()} className="btn-primary">
              {creatingSubject ? 'Creating…' : 'Create Subject'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
