import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import type { Resource, ApprovalStatus } from '../../lib/types'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import SearchBar from '../../components/SearchBar'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useToast } from '../../components/Toast'
import { FileText, CheckCircle, XCircle, Trash2, Download } from 'lucide-react'

const STATUS_FILTERS: ('all' | ApprovalStatus)[] = ['all', 'pending', 'approved', 'rejected', 'hidden']

export default function AdminResources() {
  const { toast } = useToast()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)

  const load = useCallback(async () => {
    let query = supabase
      .from('resources')
      .select('*, department:departments(name), subject:subjects(name), category:resource_categories(name), uploader:profiles(full_name)')
      .order('created_at', { ascending: false })
    if (statusFilter !== 'all') query = query.eq('approval_status', statusFilter)
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    const { data } = await query
    setResources((data ?? []) as Resource[])
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: ApprovalStatus, rejectionReason?: string) => {
    const payload: Record<string, unknown> = { approval_status: status, updated_at: new Date().toISOString() }
    if (rejectionReason) payload.rejection_reason = rejectionReason
    const { error } = await supabase.from('resources').update(payload).eq('id', id)
    if (error) { toast(error.message, 'error'); return }
    toast(`Resource ${status}`, 'success')
    load()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const resource = resources.find((r) => r.id === deleteId)
    if (resource) {
      await supabase.storage.from('resources').remove([resource.storage_path])
      await supabase.from('resources').delete().eq('id', deleteId)
      toast('Resource deleted', 'success')
      load()
    }
    setDeleteId(null)
  }

  const handleReject = () => {
    if (rejectId) updateStatus(rejectId, 'rejected', 'Rejected by administrator')
    setRejectId(null)
  }

  if (loading) return <DashboardLayout title="Resources"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Resources">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search resources…" onClear={() => setSearch('')} />
        <select className="input sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {resources.length > 0 ? (
        <div className="space-y-2">
          {resources.map((r) => (
            <div key={r.id} className="card p-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">{r.title}</p>
                <p className="text-xs text-slate-500">
                  {r.department?.name} · {r.subject?.name} · by {r.uploader?.full_name ?? 'Unknown'} · {new Date(r.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
              <span className={`badge ${r.approval_status === 'approved' ? 'badge-green' : r.approval_status === 'pending' ? 'badge-amber' : 'badge-red'}`}>
                {r.approval_status}
              </span>
              {r.approval_status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(r.id, 'approved')} className="btn-ghost text-sm text-green-600 hover:bg-green-50" title="Approve">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => setRejectId(r.id)} className="btn-ghost text-sm text-amber-600 hover:bg-amber-50" title="Reject">
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
              <button onClick={() => setDeleteId(r.id)} className="btn-ghost text-sm text-red-600 hover:bg-red-50" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={FileText} title="No resources" message={search || statusFilter !== 'all' ? "No resources match your filters." : "No resources have been uploaded yet."} />
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Resource" message="This will permanently delete the resource and its file. Are you sure?" confirmLabel="Delete" danger />
      <ConfirmDialog open={!!rejectId} onClose={() => setRejectId(null)} onConfirm={handleReject} title="Reject Resource" message="Are you sure you want to reject this resource?" confirmLabel="Reject" danger />
    </DashboardLayout>
  )
}
