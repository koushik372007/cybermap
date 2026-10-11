import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import type { ResourceCategory } from '../../lib/types'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useToast } from '../../components/Toast'
import { FolderTree, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminCategories() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ResourceCategory | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', is_active: true, display_order: 0 })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase.from('resource_categories').select('*').order('display_order', { ascending: true })
    setCategories((data ?? []) as ResourceCategory[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', is_active: true, display_order: categories.length })
    setModalOpen(true)
  }

  const openEdit = (c: ResourceCategory) => {
    setEditing(c)
    setForm({ name: c.name, description: c.description ?? '', is_active: c.is_active, display_order: c.display_order })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Name is required', 'error'); return }
    setSaving(true)
    if (editing) {
      const { error } = await supabase.from('resource_categories').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id)
      if (error) { toast(error.message, 'error'); setSaving(false); return }
      toast('Category updated', 'success')
    } else {
      const { error } = await supabase.from('resource_categories').insert(form)
      if (error) { toast(error.message, 'error'); setSaving(false); return }
      toast('Category created', 'success')
    }
    setSaving(false)
    setModalOpen(false)
    load()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('resource_categories').delete().eq('id', deleteId)
    if (error) { toast(error.message, 'error') } else { toast('Category deleted', 'success'); load() }
    setDeleteId(null)
  }

  if (loading) return <DashboardLayout title="Categories"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Resource Categories">
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> New Category</button>
      </div>

      {categories.length > 0 ? (
        <div className="space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="card p-4 flex items-center gap-3">
              <FolderTree className="w-5 h-5 text-navy-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">{c.description ?? 'No description'}</p>
              </div>
              <span className={`badge ${c.is_active ? 'badge-green' : 'badge-slate'}`}>{c.is_active ? 'Active' : 'Inactive'}</span>
              <button onClick={() => openEdit(c)} className="btn-ghost text-sm"><Edit className="w-4 h-4" /></button>
              <button onClick={() => setDeleteId(c.id)} className="btn-ghost text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={FolderTree} title="No categories" message="Create your first resource category to get started." />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Notes" />
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

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Category" message="Resources using this category may be affected. Are you sure?" confirmLabel="Delete" danger />
    </DashboardLayout>
  )
}
