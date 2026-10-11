import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import Breadcrumbs from '../../components/Breadcrumbs'
import { supabase } from '../../lib/supabase'
import type { Department, AcademicYear, Semester, Subject } from '../../lib/types'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { GraduationCap, ClipboardList, BookOpen } from 'lucide-react'

export default function StudentDepartment() {
  const { departmentId } = useParams()
  const [department, setDepartment] = useState<Department | null>(null)
  const [years, setYears] = useState<AcademicYear[]>([])
  const [semesters, setSemesters] = useState<Record<string, Semester[]>>({})
  const [subjects, setSubjects] = useState<Record<string, Subject[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!departmentId) return
      const { data: dept } = await supabase.from('departments').select('*').eq('id', departmentId).single()
      if (dept) setDepartment(dept as Department)

      const { data: yrs } = await supabase.from('academic_years').select('*').eq('is_active', true).order('display_order')
      const yearList = (yrs ?? []) as AcademicYear[]
      setYears(yearList)

      const semMap: Record<string, Semester[]> = {}
      const subjMap: Record<string, Subject[]> = {}

      for (const yr of yearList) {
        const { data: sems } = await supabase
          .from('semesters')
          .select('*')
          .eq('academic_year_id', yr.id)
          .eq('is_active', true)
          .order('display_order')
        semMap[yr.id] = (sems ?? []) as Semester[]

        for (const sem of semMap[yr.id]) {
          const { data: subs } = await supabase
            .from('subjects')
            .select('*')
            .eq('department_id', departmentId)
            .eq('academic_year_id', yr.id)
            .eq('semester_id', sem.id)
            .eq('is_active', true)
            .order('name')
          subjMap[sem.id] = (subs ?? []) as Subject[]
        }
      }
      setSemesters(semMap)
      setSubjects(subjMap)
      setLoading(false)
    }
    load()
  }, [departmentId])

  if (loading) return <DashboardLayout title="Department"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title={department?.name ?? 'Department'}>
      <Breadcrumbs items={[{ label: 'Departments', to: '/student/departments' }, { label: department?.name ?? '' }]} />

      {department?.description && (
        <p className="text-sm text-slate-600 mb-6">{department.description}</p>
      )}

      <div className="space-y-8">
        {years.map((year) => (
          <div key={year.id}>
            <h3 className="text-lg font-semibold text-navy-900 mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-navy-600" /> {year.name}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(semesters[year.id] ?? []).map((sem) => {
                const subs = subjects[sem.id] ?? []
                return (
                  <div key={sem.id} className="card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ClipboardList className="w-4 h-4 text-svcet-green" />
                      <span className="font-medium text-slate-700">{sem.name}</span>
                    </div>
                    {subs.length > 0 ? (
                      <ul className="space-y-1.5">
                        {subs.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              to={`/student/subjects/${sub.id}`}
                              className="flex items-center gap-2 text-sm text-navy-600 hover:text-navy-800 hover:bg-slate-50 rounded px-2 py-1 transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              {sub.name}
                              {sub.subject_code && <span className="text-xs text-slate-400">({sub.subject_code})</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic px-2">No subjects available in this semester yet.</p>
                    )}
                  </div>
                )
              })}
              {(semesters[year.id] ?? []).length === 0 && (
                <p className="text-sm text-slate-400 italic">No semesters configured for this academic year.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {years.length === 0 && (
        <EmptyState icon={GraduationCap} title="No academic years" message="No academic years have been configured yet." />
      )}
    </DashboardLayout>
  )
}
