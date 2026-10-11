import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../components/Toast'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast('Passwords do not match', 'error')
      return
    }
    if (password.length < 6) {
      toast('Password must be at least 6 characters', 'error')
      return
    }
    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)
    if (error) {
      toast(error, 'error')
      return
    }
    toast('Password updated successfully!', 'success')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/digitalink-svcet-shield.svg" alt="SVCET Shield" className="w-16 h-16 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Digitalink SVCET</h1>
          <p className="text-sm text-slate-300 mt-1">Sri Venkateshwaraa College of Engineering &amp; Technology</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-navy-900 mb-1">Reset Password</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your new password below.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9 pr-9"
                  placeholder="At least 6 characters"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input pl-9"
                  placeholder="Re-enter password"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
          <Link to="/login" className="block text-center text-sm text-navy-600 hover:text-navy-700 mt-4">
            Back to login
          </Link>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">Digitalink by Koushik</p>
      </div>
    </div>
  )
}
