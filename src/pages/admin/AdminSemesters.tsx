import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import type { Semester, AcademicYear } from '../../lib/types'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useToast } from '../../components/Toast'
import { ClipboardList, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminSemesters() {
  const { toast } = useToast()
  const [semesters, setSemesters] = useState<(Semester & { academic_year?: AcademicYear })[]>([])
  const [years, setYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Semester | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ academic_year_id: '', name: '', semester_number: 1, is_active: true, display_order: 0 })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [semRes, yrRes] = await Promise.all([
      supabase.from('semesters').select('*, academic_year:academic_years(*)').order('display_order', { ascending: true }),
      supabase.from('academic_years').select('*').order('display_order', { ascending: true }),
    ])
    setSemesters((semRes.data ?? []) as (Semester & { academic_year?: AcademicYear })[])
    setYears((yrRes.data ?? []) as AcademicYear[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ academic_year_id: years[0]?.id ?? '', name: '', semester_number: 1, is_active: true, display_order: semesters.length })
    setModalOpen(true)
  }

  const openEdit = (s: Semester) => {
    setEditing(s)
    setForm({ academic_year_id: s.academic_year_id, name: s.name, semester_number: s.semester_number, is_active: s.is_active, display_order: s.display_order })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.academic_year_id || !form.name.trim()) { toast('Academic year and name are required', 'error'); return }
    setSaving(true)
    if (editing) {
      const { error } = await supabase.from('semesters').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id)
      if (error) { toast(error.message, 'error'); setSaving(false); return }
      toast('Semester updated', 'success')
    } else {
      const { error } = await supabase.from('semesters').insert(form)
      if (error) { toast(error.message, 'error'); setSaving(false); return }
      toast('Semester created', 'success')
    }
    setSaving(false)
    setModalOpen(false)
    load()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('semesters').delete().eq('id', deleteId)
    if (error) { toast(error.message, 'error') } else { toast('Semester deleted', 'success'); load() }
    setDeleteId(null)
  }

  if (loading) return <DashboardLayout title="Semesters"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Semesters">
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> New Semester</button>
      </div>

      {semesters.length > 0 ? (
        <div className="space-y-2">
          {semesters.map((s) => (
            <div key={s.id} className="card p-4 flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-500">{s.academic_year?.name ?? '—'} · Sem #{s.semester_number}</p>
              </div>
              <span className={`badge ${s.is_active ? 'badge-green' : 'badge-slate'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
              <button onClick={() => openEdit(s)} className="btn-ghost text-sm"><Edit className="w-4 h-4" /></button>
              <button onClick={() => setDeleteId(s.id)} className="btn-ghost text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={ClipboardList} title="No semesters" message="Create your first semester to get started." />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Semester' : 'New Semester'}>
        <div className="space-y-4">
          <div>
            <label className="label">Academic Year</label>
            <select className="input" value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })}>
              <option value="">Select academic year…</option>
              {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Semester 1" />
            </div>
            <div>
              <label className="label">Semester Number</label>
              <input type="number" className="input" value={form.semester_number} onChange={(e) => setForm({ ...form, semester_number: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
              Active
            </label>
            <div className="flex-1">
              <label className="label">Display Order</label>
              <input type="number" className="input" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Semester" message="This will affect all subjects linked to it. Are you sure?" confirmLabel="Delete" danger />
    </DashboardLayout>
  )
}
