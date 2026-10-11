import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import Breadcrumbs from '../../components/Breadcrumbs'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../components/Toast'
import type { Resource, Subject, Department, AcademicYear, Semester, ResourceCategory } from '../../lib/types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { Download, Bookmark, FileText, Calendar, HardDrive, Tag, BookOpen } from 'lucide-react'

export default function StudentResource() {
  const { resourceId } = useParams()
  const { profile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!resourceId) return
    const { data, error } = await supabase
      .from('resources')
      .select('*, department:departments(*), academic_year:academic_years(*), semester:semesters(*), subject:subjects(*), category:resource_categories(*)')
      .eq('id', resourceId)
      .eq('approval_status', 'approved')
      .single()
    if (error || !data) { setLoading(false); return }
    setResource(data as Resource)

    // Check bookmark
    if (profile?.id) {
      const { data: bm } = await supabase.from('bookmarks').select('id').eq('user_id', profile.id).eq('resource_id', resourceId).single()
      setBookmarked(!!bm)
    }

    // Record view
    if (profile?.id) {
      await supabase.from('resource_views').insert({ user_id: profile.id, resource_id: resourceId })
    }

    setLoading(false)
  }, [resourceId, profile?.id])

  useEffect(() => { load() }, [load])

  const handleDownload = async () => {
    if (!resource) return
    const { data, error } = await supabase.storage.from('resources').createSignedUrl(resource.storage_path, 3600)
    if (error || !data?.signedUrl) {
      toast('Failed to generate download link', 'error')
      return
    }
    window.open(data.signedUrl, '_blank')
  }

  const handlePreview = async () => {
    if (!resource) return
    const { data, error } = await supabase.storage.from('resources').createSignedUrl(resource.storage_path, 3600)
    if (error || !data?.signedUrl) {
      toast('Failed to generate preview link', 'error')
      return
    }
    setDownloadUrl(data.signedUrl)
  }

  const toggleBookmark = async () => {
    if (!profile?.id || !resourceId) return
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', profile.id).eq('resource_id', resourceId)
      setBookmarked(false)
      toast('Removed from bookmarks', 'info')
    } else {
      await supabase.from('bookmarks').insert({ user_id: profile.id, resource_id: resourceId })
      setBookmarked(true)
      toast('Added to bookmarks', 'success')
    }
  }

  if (loading) return <DashboardLayout title="Resource"><LoadingSpinner /></DashboardLayout>
  if (!resource) return (
    <DashboardLayout title="Resource">
      <EmptyState icon={FileText} title="Resource not found" message="This resource may have been removed or is not available." />
    </DashboardLayout>
  )

  const ext = resource.file_extension.toLowerCase()
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext)
  const isPdf = ext === 'pdf'
  const isText = ['txt'].includes(ext)

  return (
    <DashboardLayout title={resource.title}>
      <Breadcrumbs items={[
        { label: 'Departments', to: '/student/departments' },
        { label: resource.department?.name ?? '', to: `/student/departments/${resource.department_id}` },
        { label: resource.subject?.name ?? '', to: `/student/subjects/${resource.subject_id}` },
        { label: resource.title },
      ]} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">File Preview</h3>
              <div className="flex gap-2">
                <button onClick={toggleBookmark} className={`btn-ghost text-sm ${bookmarked ? 'text-amber-600' : ''}`}>
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                  {bookmarked ? 'Saved' : 'Bookmark'}
                </button>
                <button onClick={handleDownload} className="btn-primary text-sm">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>

            {!downloadUrl ? (
              <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-lg">
                <FileText className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 mb-4">Click to preview this file securely</p>
                <button onClick={handlePreview} className="btn-secondary">Preview File</button>
              </div>
            ) : isImage ? (
              <img src={downloadUrl} alt={resource.title} className="w-full rounded-lg" />
            ) : isPdf ? (
              <iframe src={downloadUrl} className="w-full h-[600px] rounded-lg border border-slate-200" title="PDF Preview" />
            ) : isText ? (
              <iframe src={downloadUrl} className="w-full h-[600px] rounded-lg border border-slate-200" title="Text Preview" />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-lg">
                <FileText className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 mb-4">Preview not available for .{ext} files</p>
                <button onClick={handleDownload} className="btn-primary">
                  <Download className="w-4 h-4" /> Download to view
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Resource Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                <dt className="text-slate-500">Type:</dt>
                <dd className="font-medium uppercase">{resource.file_extension}</dd>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-400" />
                <dt className="text-slate-500">Size:</dt>
                <dd className="font-medium">{(resource.file_size / 1024 / 1024).toFixed(2)} MB</dd>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <dt className="text-slate-500">Category:</dt>
                <dd className="font-medium">{resource.category?.name ?? 'N/A'}</dd>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <dt className="text-slate-500">Subject:</dt>
                <dd className="font-medium">{resource.subject?.name ?? 'N/A'}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <dt className="text-slate-500">Uploaded:</dt>
                <dd className="font-medium">{new Date(resource.created_at).toLocaleDateString('en-IN')}</dd>
              </div>
            </dl>
          </div>

          {resource.description && (
            <div className="card p-5">
              <h3 className="font-semibold text-navy-900 mb-2">Description</h3>
              <p className="text-sm text-slate-600">{resource.description}</p>
            </div>
          )}

          {resource.tags && resource.tags.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-navy-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag, i) => <span key={i} className="badge-slate">{tag}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
