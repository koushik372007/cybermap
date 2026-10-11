import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import type { Department } from '../../lib/types'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { FolderTree, Search } from 'lucide-react'

export default function StudentDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [filtered, setFiltered] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data, error }) => {
        if (!error && data) {
          setDepartments(data as Department[])
          setFiltered(data as Department[])
        }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(departments.filter((d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)))
  }, [search, departments])

  if (loading) return <DashboardLayout title="Browse Resources"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Browse Resources">
      <p className="text-sm text-slate-500 mb-4">Select a department to browse academic resources.</p>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments…"
            className="input pl-9"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept) => (
          <Link key={dept.id} to={`/student/departments/${dept.id}`} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                <FolderTree className="w-6 h-6 text-navy-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{dept.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{dept.code}</p>
                {dept.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{dept.description}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={FolderTree}
          title="No departments found"
          message={search ? "Try a different search term." : "No departments are available yet."}
        />
      )}
    </DashboardLayout>
  )
}
