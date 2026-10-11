import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import Breadcrumbs from '../../components/Breadcrumbs'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { Resource, Subject, Department, AcademicYear, Semester, ResourceCategory } from '../../lib/types'
import ResourceCard from '../../components/ResourceCard'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import SearchBar from '../../components/SearchBar'
import Pagination from '../../components/Pagination'
import { BookOpen, Filter } from 'lucide-react'

const PAGE_SIZE = 12

export default function StudentSubject() {
  const { subjectId } = useParams()
  const { profile } = useAuth()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [department, setDepartment] = useState<Department | null>(null)
  const [year, setYear] = useState<AcademicYear | null>(null)
  const [semester, setSemester] = useState<Semester | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  const loadBookmarks = useCallback(async () => {
    if (!profile?.id) return
    const { data } = await supabase.from('bookmarks').select('resource_id').eq('user_id', profile.id)
    if (data) setBookmarks(new Set(data.map((b) => b.resource_id)))
  }, [profile?.id])

  useEffect(() => {
    loadBookmarks()
  }, [loadBookmarks])

  useEffect(() => {
    async function loadSubject() {
      if (!subjectId) return
      const { data: sub } = await supabase.from('subjects').select('*').eq('id', subjectId).single()
      if (!sub) { setLoading(false); return }
      setSubject(sub as Subject)
      const [d, y, s] = await Promise.all([
        supabase.from('departments').select('*').eq('id', sub.department_id).single(),
        supabase.from('academic_years').select('*').eq('id', sub.academic_year_id).single(),
        supabase.from('semesters').select('*').eq('id', sub.semester_id).single(),
      ])
      if (d.data) setDepartment(d.data as Department)
      if (y.data) setYear(y.data as AcademicYear)
      if (s.data) setSemester(s.data as Semester)

      const { data: cats } = await supabase.from('resource_categories').select('*').eq('is_active', true).order('display_order')
      if (cats) setCategories(cats as ResourceCategory[])
      setLoading(false)
    }
    loadSubject()
  }, [subjectId])

  useEffect(() => {
    if (!subjectId) return
    let query = supabase
      .from('resources')
      .select('*, department:departments(*), academic_year:academic_years(*), semester:semesters(*), subject:subjects(*), category:resource_categories(*)', { count: 'exact' })
      .eq('subject_id', subjectId)
      .eq('approval_status', 'approved')
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    if (categoryFilter) query = query.eq('category_id', categoryFilter)

    query.then(({ data, count }) => {
      setResources((data ?? []) as Resource[])
      setTotal(count ?? 0)
    })
  }, [subjectId, search, categoryFilter, page])

  const toggleBookmark = async (resourceId: string) => {
    if (!profile?.id) return
    if (bookmarks.has(resourceId)) {
      await supabase.from('bookmarks').delete().eq('user_id', profile.id).eq('resource_id', resourceId)
      setBookmarks((prev) => { const n = new Set(prev); n.delete(resourceId); return n })
    } else {
      await supabase.from('bookmarks').insert({ user_id: profile.id, resource_id: resourceId })
      setBookmarks((prev) => new Set(prev).add(resourceId))
    }
  }

  if (loading) return <DashboardLayout title="Subject"><LoadingSpinner /></DashboardLayout>

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <DashboardLayout title={subject?.name ?? 'Subject'}>
      <Breadcrumbs items={[
        { label: 'Departments', to: '/student/departments' },
        { label: department?.name ?? '', to: `/student/departments/${department?.id}` },
        { label: year?.name ?? '' },
        { label: semester?.name ?? '' },
        { label: subject?.name ?? '' },
      ]} />

      {subject?.description && <p className="text-sm text-slate-600 mb-4">{subject.description}</p>}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search resources…" onClear={() => setSearch('')} />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="input max-w-[200px]"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Resources */}
      {resources.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                linkTo={`/student/resources/${r.id}`}
                bookmarked={bookmarks.has(r.id)}
                onBookmark={() => toggleBookmark(r.id)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No resources found"
          message={search || categoryFilter ? "Try changing your filters." : "No resources have been uploaded for this subject yet."}
        />
      )}
    </DashboardLayout>
  )
}
