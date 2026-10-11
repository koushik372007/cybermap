import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import type { Resource, FacultyPermission, Department } from '../../lib/types'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Upload, FileText, FolderTree, Shield } from 'lucide-react'

export default function StaffDashboard() {
  const { profile } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [permissions, setPermissions] = useState<FacultyPermission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!profile?.id) return
      const [resRes, resPerm] = await Promise.all([
        supabase
          .from('resources')
          .select('*, department:departments(*), subject:subjects(*), category:resource_categories(*)')
          .eq('uploaded_by', profile.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('faculty_department_permissions')
          .select('*, department:departments(*)')
          .eq('faculty_user_id', profile.id),
      ])
      if (resRes.data) setResources(resRes.data as Resource[])
      if (resPerm.data) setPermissions(resPerm.data as FacultyPermission[])
      setLoading(false)
    }
    load()
  }, [profile?.id])

  if (loading) return <DashboardLayout title="Dashboard"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Faculty Dashboard">
      {/* Welcome */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-navy-800 to-navy-950 text-white">
        <div className="flex items-center gap-4">
          <img src="/assets/digitalink-svcet-shield.svg" alt="SVCET" className="w-12 h-12" />
          <div>
            <h2 className="text-xl font-bold">Welcome, {profile?.full_name}</h2>
            <p className="text-sm text-slate-300">Sri Venkateshwaraa College of Engineering &amp; Technology</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Link to="/staff/upload" className="card p-5 hover:shadow-md transition-shadow">
          <Upload className="w-8 h-8 text-svcet-green mb-2" />
          <h3 className="font-semibold text-slate-900">Upload Resource</h3>
          <p className="text-xs text-slate-500">Upload new academic materials</p>
        </Link>
        <Link to="/staff/resources" className="card p-5 hover:shadow-md transition-shadow">
          <FileText className="w-8 h-8 text-navy-600 mb-2" />
          <h3 className="font-semibold text-slate-900">My Uploads</h3>
          <p className="text-xs text-slate-500">View and manage your uploads</p>
        </Link>
        <Link to="/staff/profile" className="card p-5 hover:shadow-md transition-shadow">
          <Shield className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-semibold text-slate-900">Profile</h3>
          <p className="text-xs text-slate-500">View your account details</p>
        </Link>
      </div>

      {/* Authorized departments */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-3">Authorized Departments</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {permissions.filter((p) => p.can_upload).map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-center gap-3">
                <FolderTree className="w-5 h-5 text-navy-600" />
                <div>
                  <p className="font-semibold text-slate-900">{p.department?.name}</p>
                  <div className="flex gap-1 mt-1">
                    {p.can_upload && <span className="badge-green text-[10px]">Upload</span>}
                    {p.can_create_subjects && <span className="badge-blue text-[10px]">Create Subjects</span>}
                    {p.can_edit_resources && <span className="badge-amber text-[10px]">Edit</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {permissions.filter((p) => p.can_upload).length === 0 && (
            <EmptyState icon={Shield} title="No permissions" message="You don't have upload permissions for any department yet. Contact the administrator." />
          )}
        </div>
      </div>

      {/* Recent uploads */}
      <div>
        <h3 className="text-lg font-semibold text-navy-900 mb-3">Recent Uploads</h3>
        {resources.length > 0 ? (
          <div className="space-y-2">
            {resources.map((r) => (
              <Link key={r.id} to={`/staff/resources/${r.id}/edit`} className="card p-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{r.title}</p>
                  <p className="text-xs text-slate-500">{r.subject?.name} · {r.category?.name}</p>
                </div>
                <span className={`badge ${r.approval_status === 'approved' ? 'badge-green' : r.approval_status === 'pending' ? 'badge-amber' : 'badge-red'}`}>
                  {r.approval_status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={Upload} title="No uploads yet" message="Start uploading academic resources to see them here." />
        )}
      </div>
    </DashboardLayout>
  )
}
