import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import type { Department } from '../../lib/types'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useToast } from '../../components/Toast'
import { FolderOpen, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminDepartments() {
  const { toast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', code: '', description: '', is_active: true, display_order: 0 })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase.from('departments').select('*').order('display_order', { ascending: true })
    setDepartments((data ?? []) as Department[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', code: '', description: '', is_active: true, display_order: departments.length })
    setModalOpen(true)
  }

  const openEdit = (d: Department) => {
    setEditing(d)
    setForm({ name: d.name, code: d.code, description: d.description ?? '', is_active: d.is_active, display_order: d.display_order })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast('Name and code are required', 'error')
      return
    }
    setSaving(true)
    if (editing) {
      const { error } = await supabase.from('departments').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id)
      if (error) { toast(error.message, 'error'); setSaving(false); return }
      toast('Department updated', 'success')
    } else {
      const { error } = await supabase.from('departments').insert(form)
      if (error) { toast(error.message, 'error'); setSaving(false); return }
      toast('Department created', 'success')
    }
    setSaving(false)
    setModalOpen(false)
    load()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('departments').delete().eq('id', deleteId)
    if (error) { toast(error.message, 'error') } else { toast('Department deleted', 'success'); load() }
    setDeleteId(null)
  }

  if (loading) return <DashboardLayout title="Departments"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Departments">
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> New Department</button>
      </div>

      {departments.length > 0 ? (
        <div className="space-y-2">
          {departments.map((d) => (
            <div key={d.id} className="card p-4 flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-svcet-green flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900">{d.name}</p>
                <p className="text-xs text-slate-500">{d.code} {d.description ? `· ${d.description}` : ''}</p>
              </div>
              <span className={`badge ${d.is_active ? 'badge-green' : 'badge-slate'}`}>{d.is_active ? 'Active' : 'Inactive'}</span>
              <button onClick={() => openEdit(d)} className="btn-ghost text-sm"><Edit className="w-4 h-4" /></button>
              <button onClick={() => setDeleteId(d.id)} className="btn-ghost text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={FolderOpen} title="No departments" message="Create your first department to get started." />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Department' : 'New Department'}>
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label className="label">Code</label>
            <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CSE" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Department" message="Deleting a department will affect all subjects and resources linked to it. Are you sure?" confirmLabel="Delete" danger />
    </DashboardLayout>
  )
}
