import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-4 flex-wrap">
      <Link to="/student/dashboard" className="hover:text-navy-600 flex items-center gap-1">
        <Home className="w-3.5 h-3.5" /> Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {item.to ? (
            <Link to={item.to} className="hover:text-navy-600">{item.label}</Link>
          ) : (
            <span className="text-slate-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
