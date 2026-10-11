import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { Resource } from '../../lib/types'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import SearchBar from '../../components/SearchBar'
import { FileText, Edit, Trash2 } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useToast } from '../../components/Toast'

export default function StaffResources() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!profile?.id) return
    let query = supabase
      .from('resources')
      .select('*, department:departments(*), subject:subjects(*), category:resource_categories(*)')
      .eq('uploaded_by', profile.id)
      .order('created_at', { ascending: false })
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    const { data } = await query
    setResources((data ?? []) as Resource[])
    setLoading(false)
  }, [profile?.id, search])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    if (!deleteId) return
    const resource = resources.find((r) => r.id === deleteId)
    if (resource) {
      await supabase.storage.from('resources').remove([resource.storage_path])
      await supabase.from('resources').delete().eq('id', deleteId)
      setResources((prev) => prev.filter((r) => r.id !== deleteId))
      toast('Resource deleted successfully', 'success')
    }
    setDeleteId(null)
  }

  if (loading) return <DashboardLayout title="My Uploads"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="My Uploads">
      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search your resources…" onClear={() => setSearch('')} />
      </div>

      {resources.length > 0 ? (
        <div className="space-y-2">
          {resources.map((r) => (
            <div key={r.id} className="card p-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">{r.title}</p>
                <p className="text-xs text-slate-500">
                  {r.subject?.name} · {r.category?.name} · {new Date(r.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
              <span className={`badge ${r.approval_status === 'approved' ? 'badge-green' : r.approval_status === 'pending' ? 'badge-amber' : 'badge-red'}`}>
                {r.approval_status}
              </span>
              <Link to={`/staff/resources/${r.id}/edit`} className="btn-ghost text-sm">
                <Edit className="w-4 h-4" />
              </Link>
              <button onClick={() => setDeleteId(r.id)} className="btn-ghost text-sm text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No uploads yet"
          message={search ? "No resources match your search." : "You haven't uploaded any resources yet."}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </DashboardLayout>
  )
}
