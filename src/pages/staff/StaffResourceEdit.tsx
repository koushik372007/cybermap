import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../components/Toast'
import type { Resource, ResourceCategory } from '../../lib/types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { Save, FileText, AlertCircle } from 'lucide-react'

export default function StaffResourceEdit() {
  const { resourceId } = useParams()
  const { profile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [resource, setResource] = useState<Resource | null>(null)
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [unit, setUnit] = useState('')
  const [language, setLanguage] = useState('')
  const [versionNotes, setVersionNotes] = useState('')
  const [referenceSource, setReferenceSource] = useState('')

  const load = useCallback(async () => {
    if (!resourceId) return
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single()
    if (error || !data) { setLoading(false); return }
    setResource(data as Resource)
    setTitle(data.title)
    setDescription(data.description ?? '')
    setCategoryId(data.category_id)
    setTags(data.tags?.join(', ') ?? '')
    setUnit(data.unit ?? '')
    setLanguage(data.language ?? '')
    setVersionNotes(data.version_notes ?? '')
    setReferenceSource(data.reference_source ?? '')

    const { data: cats } = await supabase.from('resource_categories').select('*').eq('is_active', true).order('display_order')
    if (cats) setCategories(cats as ResourceCategory[])
    setLoading(false)
  }, [resourceId])

  useEffect(() => { load() }, [load])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resource || !profile?.id) return

    // Verify ownership
    if (resource.uploaded_by !== profile.id) {
      toast('You can only edit your own resources.', 'error')
      return
    }

    setSaving(true)
    const { error } = await supabase.from('resources').update({
      title,
      description: description || null,
      category_id: categoryId,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
      unit: unit || null,
      language: language || null,
      version_notes: versionNotes || null,
      reference_source: referenceSource || null,
      updated_at: new Date().toISOString(),
    }).eq('id', resource.id)

    setSaving(false)
    if (error) {
      toast(error.message, 'error')
      return
    }
    toast('Resource updated successfully!', 'success')
    navigate('/staff/resources')
  }

  if (loading) return <DashboardLayout title="Edit Resource"><LoadingSpinner /></DashboardLayout>
  if (!resource) return (
    <DashboardLayout title="Edit Resource">
      <EmptyState icon={FileText} title="Resource not found" message="This resource may have been removed." />
    </DashboardLayout>
  )

  return (
    <DashboardLayout title="Edit Resource">
      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FileText className="w-4 h-4" />
            {resource.original_file_name} · {resource.file_extension.toUpperCase()} · {(resource.file_size / 1024 / 1024).toFixed(2)} MB
          </div>

          <div>
            <label className="label">Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
          </div>

          <div>
            <label className="label">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[80px]" />
          </div>

          <div>
            <label className="label">Tags (comma-separated)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="input" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Unit / Module</label>
              <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Language</label>
              <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Version Notes</label>
            <input type="text" value={versionNotes} onChange={(e) => setVersionNotes(e.target.value)} className="input" />
          </div>

          <div>
            <label className="label">Academic Source / Reference</label>
            <input type="text" value={referenceSource} onChange={(e) => setReferenceSource(e.target.value)} className="input" />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/staff/resources')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </DashboardLayout>
  )
}
