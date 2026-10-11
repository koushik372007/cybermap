import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../lib/auth'
import { Mail, Shield, Calendar, User } from 'lucide-react'

export default function StudentProfile() {
  const { profile } = useAuth()

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-2xl">
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center">
              <User className="w-8 h-8 text-navy-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900">{profile?.full_name}</h2>
              <span className="badge-navy capitalize">{profile?.role}</span>
            </div>
          </div>

          <dl className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">{profile?.email}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <Shield className="w-5 h-5 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-500">Role</dt>
                <dd className="font-medium text-slate-900 capitalize">{profile?.role}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-500">Member since</dt>
                <dd className="font-medium text-slate-900">
                  {profile ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-500">Status</dt>
                <dd><span className="badge-green capitalize">{profile?.status}</span></dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </DashboardLayout>
  )
}
