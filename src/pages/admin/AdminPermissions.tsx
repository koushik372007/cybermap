import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import type { FacultyPermission, Department, Profile } from '../../lib/types'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useToast } from '../../components/Toast'
import { Shield, Plus, Trash2 } from 'lucide-react'

export default function AdminPermissions() {
  const { toast } = useToast()
  const [permissions, setPermissions] = useState<(FacultyPermission & { department?: Department; faculty?: Profile })[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [faculty, setFaculty] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ faculty_user_id: '', department_id: '', can_upload: true, can_create_subjects: true, can_edit_resources: true })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [permRes, depRes, facRes] = await Promise.all([
      supabase.from('faculty_permissions').select('*, department:departments(*), faculty:profiles(*)').order('created_at', { ascending: false }),
      supabase.from('departments').select('*').eq('is_active', true).order('display_order', { ascending: true }),
      supabase.from('profiles').select('*').eq('role', 'faculty').eq('status', 'active').order('full_name', { ascending: true }),
    ])
    setPermissions((permRes.data ?? []) as any[])
    setDepartments((depRes.data ?? []) as Department[])
    setFaculty((facRes.data ?? []) as Profile[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm({ faculty_user_id: faculty[0]?.id ?? '', department_id: departments[0]?.id ?? '', can_upload: true, can_create_subjects: true, can_edit_resources: true })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.faculty_user_id || !form.department_id) { toast('Faculty and department are required', 'error'); return }
    setSaving(true)
    const { error } = await supabase.from('faculty_permissions').insert(form)
    if (error) { toast(error.message, 'error'); setSaving(false); return }
    toast('Permission granted', 'success')
    setSaving(false)
    setModalOpen(false)
    load()
  }

  const togglePermission = async (p: FacultyPermission, field: 'can_upload' | 'can_create_subjects' | 'can_edit_resources') => {
    const { error } = await supabase.from('faculty_permissions').update({ [field]: !p[field] }).eq('id', p.id)
    if (error) { toast(error.message, 'error'); return }
    load()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('faculty_permissions').delete().eq('id', deleteId)
    if (error) { toast(error.message, 'error') } else { toast('Permission revoked', 'success'); load() }
    setDeleteId(null)
  }

  if (loading) return <DashboardLayout title="Permissions"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Faculty Permissions">
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Grant Permission</button>
      </div>

      {permissions.length > 0 ? (
        <div className="space-y-2">
          {permissions.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-navy-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900">{p.faculty?.full_name ?? 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{p.department?.name ?? 'Unknown department'}</p>
                </div>
                <button onClick={() => setDeleteId(p.id)} className="btn-ghost text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-4 pl-8">
                {(['can_upload', 'can_create_subjects', 'can_edit_resources'] as const).map((field) => (
                  <label key={field} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={p[field]} onChange={() => togglePermission(p, field)} className="rounded" />
                    {field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Shield} title="No permissions" message="Grant faculty members permission to upload and manage resources." />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Grant Permission">
        <div className="space-y-4">
          <div>
            <label className="label">Faculty Member</label>
            <select className="input" value={form.faculty_user_id} onChange={(e) => setForm({ ...form, faculty_user_id: e.target.value })}>
              <option value="">Select faculty…</option>
              {faculty.map((f) => <option key={f.id} value={f.id}>{f.full_name} ({f.email})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
              <option value="">Select department…</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            {(['can_upload', 'can_create_subjects', 'can_edit_resources'] as const).map((field) => (
              <label key={field} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.checked })} className="rounded" />
                {field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Revoke Permission" message="This will remove all permissions for this faculty-department pair. Are you sure?" confirmLabel="Revoke" danger />
    </DashboardLayout>
  )
}
