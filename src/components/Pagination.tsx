import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="btn-secondary text-sm disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" /> Prev
      </button>
      <span className="text-sm text-slate-600 px-3">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className="btn-secondary text-sm disabled:opacity-40"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
