import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import type { AcademicYear } from '../../lib/types'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useToast } from '../../components/Toast'
import { GraduationCap, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminAcademicYears() {
  const { toast } = useToast()
  const [years, setYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AcademicYear | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '', is_active: true, display_order: 0 })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase.from('academic_years').select('*').order('display_order', { ascending: true })
    setYears((data ?? []) as AcademicYear[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', start_date: '', end_date: '', is_active: true, display_order: years.length })
    setModalOpen(true)
  }

  const openEdit = (y: AcademicYear) => {
    setEditing(y)
    setForm({ name: y.name, start_date: y.start_date ?? '', end_date: y.end_date ?? '', is_active: y.is_active, display_order: y.display_order })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Name is required', 'error'); return }
    setSaving(true)
    const payload = { ...form, start_date: form.start_date || null, end_date: form.end_date || null }
    if (editing) {
      const { error } = await supabase.from('academic_years').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id)
      if (error) { toast(error.message, 'error'); setSaving(false); return }
      toast('Academic year updated', 'success')
    } else {
      const { error } = await supabase.from('academic_years').insert(payload)
      if (error) { toast(error.message, 'error'); setSaving(false); return }
      toast('Academic year created', 'success')
    }
    setSaving(false)
    setModalOpen(false)
    load()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('academic_years').delete().eq('id', deleteId)
    if (error) { toast(error.message, 'error') } else { toast('Academic year deleted', 'success'); load() }
    setDeleteId(null)
  }

  if (loading) return <DashboardLayout title="Academic Years"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Academic Years">
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> New Academic Year</button>
      </div>

      {years.length > 0 ? (
        <div className="space-y-2">
          {years.map((y) => (
            <div key={y.id} className="card p-4 flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-navy-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900">{y.name}</p>
                <p className="text-xs text-slate-500">
                  {y.start_date ? new Date(y.start_date).toLocaleDateString('en-IN') : '—'} → {y.end_date ? new Date(y.end_date).toLocaleDateString('en-IN') : '—'}
                </p>
              </div>
              <span className={`badge ${y.is_active ? 'badge-green' : 'badge-slate'}`}>{y.is_active ? 'Active' : 'Inactive'}</span>
              <button onClick={() => openEdit(y)} className="btn-ghost text-sm"><Edit className="w-4 h-4" /></button>
              <button onClick={() => setDeleteId(y.id)} className="btn-ghost text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={GraduationCap} title="No academic years" message="Create your first academic year to get started." />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Academic Year' : 'New Academic Year'}>
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 2024-2025" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
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

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Academic Year" message="This will affect all semesters and subjects linked to it. Are you sure?" confirmLabel="Delete" danger />
    </DashboardLayout>
  )
}
