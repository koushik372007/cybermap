import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import { Users, FolderOpen, BookOpen, FileText, Clock, AlertCircle } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, departments: 0, subjects: 0, resources: 0, pending: 0 })
  const [recentUploads, setRecentUploads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [u, d, s, r, p, recent] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('departments').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('resources').select('id', { count: 'exact', head: true }),
        supabase.from('resources').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'),
        supabase.from('resources').select('*, department:departments(name), subject:subjects(name), category:resource_categories(name)').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({
        users: u.count ?? 0,
        departments: d.count ?? 0,
        subjects: s.count ?? 0,
        resources: r.count ?? 0,
        pending: p.count ?? 0,
      })
      setRecentUploads(recent.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <DashboardLayout title="Admin Dashboard"><LoadingSpinner /></DashboardLayout>

  const cards = [
    { label: 'Registered Users', value: stats.users, icon: <Users className="w-6 h-6 text-navy-600" />, to: '/admin/users' },
    { label: 'Active Departments', value: stats.departments, icon: <FolderOpen className="w-6 h-6 text-svcet-green" />, to: '/admin/departments' },
    { label: 'Active Subjects', value: stats.subjects, icon: <BookOpen className="w-6 h-6 text-blue-600" />, to: '/admin/subjects' },
    { label: 'Total Resources', value: stats.resources, icon: <FileText className="w-6 h-6 text-navy-600" />, to: '/admin/resources' },
    { label: 'Pending Approval', value: stats.pending, icon: <AlertCircle className="w-6 h-6 text-amber-500" />, to: '/admin/resources' },
  ]

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {cards.map((c, i) => (
          <Link key={i} to={c.to} className="card p-4 hover:shadow-md transition-shadow">
            <div className="mb-2">{c.icon}</div>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-navy-900 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-navy-600" /> Recent Uploads
        </h3>
        <div className="space-y-2">
          {recentUploads.map((r) => (
            <Link key={r.id} to="/admin/resources" className="card p-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">{r.title}</p>
                <p className="text-xs text-slate-500">{r.department?.name} · {r.subject?.name}</p>
              </div>
              <span className={`badge ${r.approval_status === 'approved' ? 'badge-green' : r.approval_status === 'pending' ? 'badge-amber' : 'badge-red'}`}>
                {r.approval_status}
              </span>
            </Link>
          ))}
          {recentUploads.length === 0 && <p className="text-sm text-slate-400 italic">No resources uploaded yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  )
}
