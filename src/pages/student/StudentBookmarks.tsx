import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { Resource } from '../../lib/types'
import ResourceCard from '../../components/ResourceCard'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Bookmark } from 'lucide-react'

export default function StudentBookmarks() {
  const { profile } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    if (!profile?.id) return
    const { data, error } = await supabase
      .from('bookmarks')
      .select('resource_id, resource:resources(*, department:departments(*), subject:subjects(*), category:resource_categories(*))')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
    if (!error && data) {
      const items = data.map((b: any) => b.resource).filter(Boolean) as Resource[]
      setResources(items)
      setBookmarks(new Set(items.map((r) => r.id)))
    }
    setLoading(false)
  }, [profile?.id])

  useEffect(() => { load() }, [load])

  const toggleBookmark = async (resourceId: string) => {
    if (!profile?.id) return
    await supabase.from('bookmarks').delete().eq('user_id', profile.id).eq('resource_id', resourceId)
    setResources((prev) => prev.filter((r) => r.id !== resourceId))
    setBookmarks((prev) => { const n = new Set(prev); n.delete(resourceId); return n })
  }

  if (loading) return <DashboardLayout title="Bookmarks"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="My Bookmarks">
      {resources.length > 0 ? (
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
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          message="Bookmark resources to quickly access them later."
        />
      )}
    </DashboardLayout>
  )
}
