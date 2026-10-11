import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import type { Resource, Department } from '../../lib/types'
import ResourceCard from '../../components/ResourceCard'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { FolderTree, BookOpen, Clock, Bookmark, Search } from 'lucide-react'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [recentResources, setRecentResources] = useState<Resource[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [resDept, resRes, resBm] = await Promise.all([
        supabase.from('departments').select('*').eq('is_active', true).order('display_order'),
        supabase
          .from('resources')
          .select('*, department:departments(*), subject:subjects(*), category:resource_categories(*)')
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false })
          .limit(6),
        supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', profile?.id),
      ])
      if (resDept.data) setDepartments(resDept.data as Department[])
      if (resRes.data) setRecentResources(resRes.data as Resource[])
      if (resBm.count !== null) setBookmarkCount(resBm.count)
      setLoading(false)
    }
    load()
  }, [profile?.id])

  if (loading) return <DashboardLayout title="Dashboard"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-navy-800 to-navy-950 text-white">
        <div className="flex items-center gap-4">
          <img src="/assets/digitalink-svcet-shield.svg" alt="SVCET" className="w-12 h-12" />
          <div>
            <h2 className="text-xl font-bold">Welcome back, {profile?.full_name}!</h2>
            <p className="text-sm text-slate-300">Sri Venkateshwaraa College of Engineering &amp; Technology</p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <FolderTree className="w-6 h-6 text-navy-600 mb-2" />
          <p className="text-2xl font-bold text-slate-900">{departments.length}</p>
          <p className="text-xs text-slate-500">Departments</p>
        </div>
        <div className="card p-4">
          <BookOpen className="w-6 h-6 text-svcet-green mb-2" />
          <p className="text-2xl font-bold text-slate-900">{recentResources.length}</p>
          <p className="text-xs text-slate-500">Recent Resources</p>
        </div>
        <div className="card p-4">
          <Bookmark className="w-6 h-6 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-slate-900">{bookmarkCount}</p>
          <p className="text-xs text-slate-500">Bookmarks</p>
        </div>
        <Link to="/student/departments" className="card p-4 hover:shadow-md transition-shadow">
          <Search className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-sm font-semibold text-navy-700">Browse All</p>
          <p className="text-xs text-slate-500">Explore resources</p>
        </Link>
      </div>

      {/* Departments */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Browse by Department</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Link key={dept.id} to={`/student/departments/${dept.id}`} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
                  <FolderTree className="w-5 h-5 text-navy-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{dept.name}</p>
                  <p className="text-xs text-slate-500">{dept.code}</p>
                </div>
              </div>
            </Link>
          ))}
          {departments.length === 0 && (
            <EmptyState icon={FolderTree} title="No departments" message="No departments are available yet." />
          )}
        </div>
      </div>

      {/* Recent resources */}
      <div>
        <h3 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-navy-600" /> Recently Added
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentResources.map((r) => (
            <ResourceCard key={r.id} resource={r} linkTo={`/student/resources/${r.id}`} showBookmark={false} />
          ))}
        </div>
        {recentResources.length === 0 && (
          <EmptyState icon={BookOpen} title="No resources yet" message="No resources have been uploaded yet. Check back later." />
        )}
      </div>
    </DashboardLayout>
  )
}
