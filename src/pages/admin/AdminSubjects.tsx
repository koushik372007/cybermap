import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import type { Subject, Department, AcademicYear, Semester } from '../../lib/types'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import SearchBar from '../../components/SearchBar'
import { useToast } from '../../components/Toast'
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminSubjects() {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<(Subject & { department?: Department; academic_year?: AcademicYear; semester?: Semester })[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [years, setYears] = useState<AcademicYear[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ department_id: '', academic_year_id: '', semester_id: '', name: '', subject_code: '', description: '', is_active: true })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [subRes, depRes, yrRes, semRes] = await Promise.all([
      supabase.from('subjects').select('*, department:departments(*), academic_year:academic_years(*), semester:semesters(*)').order('created_at', { ascending: false }),
      supabase.from('departments').select('*').eq('is_active', true).order('display_order', { ascending: true }),
      supabase.from('academic_years').select('*').eq('is_active', true).order('display_order', { ascending: true }),
      supabase.from('semesters').select('*').eq('is_active', true).order('display_order', { ascending: true }),
    ])
    setSubjects((subRes.data ?? []) as any[])
    setDepartments((depRes.data ?? []) as Department[])
    setYears((yrRes.data ?? []) as AcademicYear[])
    setSemesters((semRes.data ?? []) as Semester[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = subjects.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.subject_code ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ department_id: departments[0]?.id ?? '', academic_year_id: years[0]?.id ?? '', semester_id: semesters[0]?.id ?? '', name: '', subject_code: '', description: '', is_active: true })
    setModalOpen(true)
  }

  const openEdit = (s: Subject) => {
    setEditing(s)
    setForm({ department_id: s.department_id, academic_year_id: s.academic_year_id, semester_id: s.semester_id, name: s.name, subject_code: s.subject_code ?? '', description: s.description ?? '', is_active: s.is_active })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.department_id || !form.semester_id) { toast('Name, department, and semester are required', 'error'); return }
    setSaving(true)
    if (editing) {
      const { error } = await supabase.from('subjects').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id)
      if (error) { toast(error.message, 'error'); setSaving(false); return }
      toast('Subject updated', 'success')
    } else {
      const { error } = await supabase.from('subjects').insert(form)
      if (error) { toast(error.message, 'error'); setSaving(false); return }
      toast('Subject created', 'success')
    }
    setSaving(false)
    setModalOpen(false)
    load()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('subjects').delete().eq('id', deleteId)
    if (error) { toast(error.message, 'error') } else { toast('Subject deleted', 'success'); load() }
    setDeleteId(null)
  }

  if (loading) return <DashboardLayout title="Subjects"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Subjects">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search subjects…" onClear={() => setSearch('')} />
        <button onClick={openCreate} className="btn-primary whitespace-nowrap"><Plus className="w-4 h-4" /> New Subject</button>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((s) => (
            <div key={s.id} className="card p-4 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">{s.name} {s.subject_code ? `(${s.subject_code})` : ''}</p>
                <p className="text-xs text-slate-500">{s.department?.name} · {s.semester?.name} · {s.academic_year?.name}</p>
              </div>
              <span className={`badge ${s.is_active ? 'badge-green' : 'badge-slate'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
              <button onClick={() => openEdit(s)} className="btn-ghost text-sm"><Edit className="w-4 h-4" /></button>
              <button onClick={() => setDeleteId(s.id)} className="btn-ghost text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="No subjects" message={search ? "No subjects match your search." : "Create your first subject to get started."} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Subject' : 'New Subject'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                <option value="">Select…</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Academic Year</label>
              <select className="input" value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })}>
                <option value="">Select…</option>
                {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Semester</label>
              <select className="input" value={form.semester_id} onChange={(e) => setForm({ ...form, semester_id: e.target.value })}>
                <option value="">Select…</option>
                {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Structures" />
            </div>
            <div>
              <label className="label">Subject Code</label>
              <input className="input" value={form.subject_code} onChange={(e) => setForm({ ...form, subject_code: e.target.value })} placeholder="e.g. CS201" />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Subject" message="This will affect all resources linked to it. Are you sure?" confirmLabel="Delete" danger />
    </DashboardLayout>
  )
}
