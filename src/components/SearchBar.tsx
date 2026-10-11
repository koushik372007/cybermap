import { Search } from 'lucide-react'

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  onClear,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onClear?: () => void
}) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
        >
          ✕
        </button>
      )}
    </div>
  )
}
