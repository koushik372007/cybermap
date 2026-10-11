import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import type { UserRole } from '../lib/types'

export default function ProtectedRoute({ role }: { role: UserRole }) {
  const { session, profile, loading, isConfigured } = useAuth()

  if (!isConfigured) return <Navigate to="/" replace />
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <img src="/assets/digitalink-svcet-shield.svg" alt="Loading" className="w-16 h-16" />
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/login" replace />
  if (profile.status === 'suspended') return <Navigate to="/login?reason=suspended" replace />
  if (profile.role !== role) {
    // Redirect to the correct dashboard
    const dash = profile.role === 'admin' ? '/admin/dashboard' : profile.role === 'faculty' ? '/staff/dashboard' : '/student/dashboard'
    return <Navigate to={dash} replace />
  }
  return null
}
