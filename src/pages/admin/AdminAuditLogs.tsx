import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import type { AuditLog } from '../../lib/types'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import SearchBar from '../../components/SearchBar'
import { ScrollText } from 'lucide-react'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<(AuditLog & { actor?: { full_name: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const load = useCallback(async () => {
    let query = supabase
      .from('audit_logs')
      .select('*, actor:profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (actionFilter !== 'all') query = query.eq('action', actionFilter)
    if (search) query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%`)
    const { data } = await query
    setLogs((data ?? []) as any[])
    setLoading(false)
  }, [search, actionFilter])

  useEffect(() => { load() }, [load])

  if (loading) return <DashboardLayout title="Audit Logs"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Audit Logs">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search logs…" onClear={() => setSearch('')} />
        <select className="input sm:w-40" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
        </select>
      </div>

      {logs.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <ScrollText className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">{log.actor?.full_name ?? 'System'}</span>{' '}
                    <span className="text-slate-500">performed</span>{' '}
                    <span className="badge badge-slate">{log.action}</span>{' '}
                    <span className="text-slate-500">on</span>{' '}
                    <span className="font-medium">{log.entity_type}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                    {log.entity_id ? ` · ID: ${log.entity_id.slice(0, 8)}…` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState icon={ScrollText} title="No audit logs" message={search || actionFilter !== 'all' ? "No logs match your filters." : "No activity has been logged yet."} />
      )}
    </DashboardLayout>
  )
}
