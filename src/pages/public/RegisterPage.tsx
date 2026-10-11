import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../components/Toast'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error, needsVerification } = await signUp(email, password, fullName)
    setLoading(false)

    if (error) {
      setError(error)
      toast(error, 'error')
      return
    }

    if (needsVerification) {
      setRegistered(true)
      toast('Registration successful! Please check your email to verify your account.', 'success')
    } else {
      toast('Registration successful!', 'success')
      navigate('/')
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-navy-900 mb-2">Check Your Email</h2>
            <p className="text-sm text-slate-600 mb-6">
              We've sent a verification link to <strong>{email}</strong>. Please verify your
              email to activate your account, then sign in.
            </p>
            <Link to="/login" className="btn-primary w-full">Go to Login</Link>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">Digitalink by Koushik</p>
        </div>
      </div>
    )
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
          <h2 className="text-xl font-semibold text-navy-900 mb-1">Create Account</h2>
          <p className="text-sm text-slate-500 mb-6">
            Register as a student to access academic resources
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input pl-9"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9 pr-9"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
              New registrations are assigned the <strong>student</strong> role by default.
              Faculty and administrator accounts are granted by an authorized administrator.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-navy-600 hover:text-navy-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">Digitalink by Koushik</p>
      </div>
    </div>
  )
}
