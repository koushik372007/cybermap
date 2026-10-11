import { AlertCircle } from 'lucide-react'

export default function NotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-lg text-center">
        <img src="/assets/digitalink-svcet-shield.svg" alt="SVCET Shield" className="w-20 h-20 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-navy-900 mb-3">Supabase Not Configured</h1>
        <div className="card p-6 text-left">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              Digitalink SVCET requires a Supabase project for authentication, database, and file storage.
              Set the following environment variables to get started:
            </p>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
          <p className="text-sm text-slate-600 mt-4">
            See the <code className="text-navy-600">README.md</code> and{' '}
            <code className="text-navy-600">supabase/migrations</code> for full setup instructions
            including database schema, RLS policies, and storage configuration.
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-6">Digitalink by Koushik</p>
      </div>
    </div>
  )
}
