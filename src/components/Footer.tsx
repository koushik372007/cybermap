import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2.5">
              <img src="/assets/digitalink-svcet-shield.svg" alt="SVCET Shield" className="w-10 h-10" />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-white text-lg">Digitalink</span>
                <span className="text-[10px] text-slate-400">SVCET Academic Resources</span>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Sri Venkateshwaraa College of Engineering &amp; Technology
            </p>
            <p className="text-xs text-slate-500">Ariyur, Puducherry — 605102</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">About</h4>
            <p className="text-sm text-slate-400">
              A centralized academic resource platform for students and faculty of SVCET.
              Browse, upload, and manage learning materials organized by department, year, and semester.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Sri Venkateshwaraa College of Engineering &amp; Technology. All rights reserved.
          </p>
          <p className="text-sm font-semibold text-white">
            Digitalink by Koushik
          </p>
        </div>
      </div>
    </footer>
  )
}
