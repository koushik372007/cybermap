import { FileText, FileImage, FileSpreadsheet, File, Download, Bookmark, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Resource } from '../lib/types'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileIcon(ext: string) {
  const e = ext.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif'].includes(e)) return <FileImage className="w-5 h-5 text-purple-600" />
  if (['xls', 'xlsx'].includes(e)) return <FileSpreadsheet className="w-5 h-5 text-green-600" />
  return <FileText className="w-5 h-5 text-blue-600" />
}

export default function ResourceCard({
  resource,
  onBookmark,
  onDownload,
  onPreview,
  bookmarked = false,
  showBookmark = true,
  linkTo,
}: {
  resource: Resource
  onBookmark?: () => void
  onDownload?: () => void
  onPreview?: () => void
  bookmarked?: boolean
  showBookmark?: boolean
  linkTo?: string
}) {
  const date = new Date(resource.created_at).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  const content = (
    <div className="card p-4 hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          {fileIcon(resource.file_extension)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{resource.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {resource.subject?.name ?? 'Unknown subject'} · {resource.category?.name ?? 'Uncategorized'}
          </p>
        </div>
      </div>

      {resource.description && (
        <p className="text-xs text-slate-600 line-clamp-2">{resource.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="badge-slate uppercase">{resource.file_extension}</span>
        <span>{formatSize(resource.file_size)}</span>
        <span>·</span>
        <span>{date}</span>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        {onPreview && (
          <button onClick={onPreview} className="btn-ghost text-xs flex-1">
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        )}
        {onDownload && (
          <button onClick={onDownload} className="btn-ghost text-xs flex-1">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        )}
        {showBookmark && onBookmark && (
          <button
            onClick={onBookmark}
            className={`btn-ghost text-xs ${bookmarked ? 'text-amber-600' : ''}`}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
    </div>
  )

  if (linkTo) return <Link to={linkTo}>{content}</Link>
  return content
}
