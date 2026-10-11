import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import type { AppSettings } from '../../lib/types'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useToast } from '../../components/Toast'
import { Settings, Save } from 'lucide-react'

export default function AdminSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fileTypes, setFileTypes] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('app_settings').select('*').limit(1).single()
    if (data) {
      setSettings(data as AppSettings)
      setFileTypes((data.allowed_file_types ?? []).join(', '))
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    const types = fileTypes.split(',').map((t) => t.trim()).filter(Boolean)
    const { error } = await supabase.from('app_settings').update({
      approval_required: settings.approval_required,
      max_file_size_mb: settings.max_file_size_mb,
      allowed_file_types: types,
      updated_at: new Date().toISOString(),
    }).eq('id', settings.id)
    if (error) { toast(error.message, 'error'); setSaving(false); return }
    toast('Settings saved', 'success')
    setSaving(false)
    load()
  }

  if (loading) return <DashboardLayout title="Settings"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Settings">
      <div className="card p-6 max-w-2xl space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
          <Settings className="w-5 h-5 text-navy-600" />
          <h3 className="text-lg font-semibold text-navy-900">Application Settings</h3>
        </div>

        {settings && (
          <>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-700">Require Approval for Uploads</p>
                <p className="text-xs text-slate-500">When enabled, faculty uploads must be approved by an admin before students can see them.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.approval_required}
                onChange={(e) => setSettings({ ...settings, approval_required: e.target.checked })}
                className="w-5 h-5 rounded"
              />
            </label>

            <div>
              <label className="label">Max File Size (MB)</label>
              <input
                type="number"
                className="input"
                value={settings.max_file_size_mb}
                onChange={(e) => setSettings({ ...settings, max_file_size_mb: Number(e.target.value) })}
              />
              <p className="text-xs text-slate-500 mt-1">Maximum file size for uploads in megabytes.</p>
            </div>

            <div>
              <label className="label">Allowed File Types</label>
              <input
                className="input"
                value={fileTypes}
                onChange={(e) => setFileTypes(e.target.value)}
                placeholder="pdf, docx, pptx, jpg, png"
              />
              <p className="text-xs text-slate-500 mt-1">Comma-separated list of allowed file extensions (without dots).</p>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
