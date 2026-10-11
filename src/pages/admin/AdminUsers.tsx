import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { supabase } from '../../lib/supabase'
import type { Profile, UserRole, UserStatus } from '../../lib/types'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import SearchBar from '../../components/SearchBar'
import { useToast } from '../../components/Toast'
import { Users, Shield, UserCog, Trash2 } from 'lucide-react'

export default function AdminUsers() {
  const { toast } = useToast()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')

  const load = useCallback(async () => {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (roleFilter !== 'all') query = query.eq('role', roleFilter)
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    const { data } = await query
    setUsers((data ?? []) as Profile[])
    setLoading(false)
  }, [search, roleFilter])

  useEffect(() => { load() }, [load])

  const updateRole = async (id: string, role: UserRole) => {
    const { error } = await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { toast(error.message, 'error'); return }
    toast('Role updated', 'success')
    load()
  }

  const toggleStatus = async (u: Profile) => {
    const newStatus: UserStatus = u.status === 'active' ? 'suspended' : 'active'
    const { error } = await supabase.from('profiles').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', u.id)
    if (error) { toast(error.message, 'error'); return }
    toast(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`, 'success')
    load()
  }

  if (loading) return <DashboardLayout title="Users"><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Users">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users…" onClear={() => setSearch('')} />
        <select className="input sm:w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {users.length > 0 ? (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-navy-700">{u.full_name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">{u.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
              </div>
              <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}>{u.status}</span>
              <select
                value={u.role}
                onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                className="input w-28 text-xs py-1"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={() => toggleStatus(u)} className="btn-ghost text-sm" title={u.status === 'active' ? 'Suspend' : 'Activate'}>
                <Shield className={`w-4 h-4 ${u.status === 'active' ? 'text-amber-600' : 'text-green-600'}`} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title="No users" message={search || roleFilter !== 'all' ? "No users match your filters." : "No users have registered yet."} />
      )}
    </DashboardLayout>
  )
}
