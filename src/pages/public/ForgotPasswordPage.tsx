import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../components/Toast'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      toast(error, 'error')
      return
    }
    setSent(true)
    toast('Password reset link sent. Check your email.', 'success')
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-navy-900 mb-2">Check Your Email</h2>
              <p className="text-sm text-slate-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>.
                Follow the link in the email to reset your password.
              </p>
              <Link to="/login" className="btn-primary w-full">Back to Login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-navy-900 mb-1">Forgot Password</h2>
              <p className="text-sm text-slate-500 mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="flex items-center gap-1 text-sm text-navy-600 hover:text-navy-700 mt-4">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </>
          )}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">Digitalink by Koushik</p>
      </div>
    </div>
  )
}
