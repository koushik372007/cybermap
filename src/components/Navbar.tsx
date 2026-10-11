import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Shield } from 'lucide-react'

export default function Navbar({ onLogout }: { onLogout?: () => void }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    if (onLogout) onLogout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/assets/digitalink-svcet-shield.svg" alt="SVCET Shield" className="w-9 h-9" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-navy-900 text-lg">Digitalink</span>
              <span className="text-[10px] text-slate-500 -mt-0.5">SVCET Academic Resources</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {profile ? (
              <>
                <span className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                  <Shield className="w-4 h-4 text-navy-600" />
                  <span className="font-medium">{profile.full_name}</span>
                  <span className="badge-navy capitalize">{profile.role}</span>
                </span>
                <button onClick={handleLogout} className="btn-ghost text-sm">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
