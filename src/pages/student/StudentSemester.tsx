import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import Breadcrumbs from '../../components/Breadcrumbs'
import { supabase } from '../../lib/supabase'
import type { Semester, Subject, AcademicYear, Department } from '../../lib/types'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { BookOpen, ClipboardList } from 'lucide-react'

export default function StudentSemester() {
  const { semesterId } = useParams()
  const [semester, setSemester] = useState<Semester | null>(null)
  const [year, setYear] = useState<AcademicYear | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!semesterId) return
      const { data: sem } = await supabase.from('semesters').select('*').eq('id', semesterId).single()
      if (sem) {
        setSemester(sem as Semester)
        const { data: yr } = await supabase.from('academic_years').select('*').eq('id', sem.academic_year_id).single()
        if (yr) setYear(yr as AcademicYear)
        const { data: subs } = await supabase
          .from('subjects')
          .select('*')
          .eq('semester_id', semesterId)
          .eq('is_active', true)
          .order('name')
        setSubjects((subs ?? []) as Subject[])
      }
      setLoading(false)
    }
    load()
  }, [semesterId])

  if (loading) return <DashboardLayout title="Semester"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title={semester?.name ?? 'Semester'}>
      <Breadcrumbs items={[
        { label: 'Departments', to: '/student/departments' },
        { label: year?.name ?? 'Academic Year' },
        { label: semester?.name ?? 'Semester' },
      ]} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => (
          <Link key={sub.id} to={`/student/subjects/${sub.id}`} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-navy-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{sub.name}</p>
                {sub.subject_code && <p className="text-xs text-slate-500">{sub.subject_code}</p>}
                {sub.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sub.description}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {subjects.length === 0 && (
        <EmptyState icon={ClipboardList} title="No subjects available" message="No subjects are available in this semester yet." />
      )}
    </DashboardLayout>
  )
}
