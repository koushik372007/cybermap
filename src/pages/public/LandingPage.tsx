import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { ArrowRight, BookOpen, Upload, Shield, Search, FolderTree, GraduationCap, Lock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero with college banner */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(22,163,74,0.2) 0%, transparent 50%)'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src="/assets/digitalink-svcet-shield.svg" alt="SVCET Shield" className="w-14 h-14" />
                <div>
                  <h1 className="text-3xl font-bold">Digitalink</h1>
                  <p className="text-sm text-slate-300">SVCET Academic Resources</p>
                </div>
              </div>
              <h2 className="text-2xl lg:text-4xl font-bold mb-4 leading-tight">
                Your Centralized Academic Resource Platform
              </h2>
              <p className="text-slate-300 mb-8 max-w-lg">
                Browse, download, and organize academic materials for Sri Venkateshwaraa College
                of Engineering &amp; Technology. Access notes, question papers, lab manuals, and more —
                organized by department, year, and semester.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/register" className="btn-accent text-base px-6 py-3">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-6 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Explore Resources
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <img
                src="/assets/svcet-college-banner.svg"
                alt="Sri Venkateshwaraa College of Engineering & Technology"
                className="w-full max-w-2xl rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center text-navy-900 mb-2">Platform Features</h2>
        <p className="text-center text-slate-500 mb-10">Everything you need for academic resource management</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <FolderTree className="w-6 h-6 text-navy-600" />, title: 'Dynamic Academic Structure', desc: 'Department → Year → Semester → Subject hierarchy, all database-driven and fully manageable.' },
            { icon: <Upload className="w-6 h-6 text-svcet-green" />, title: 'Secure File Uploads', desc: 'Faculty upload materials with validation, progress tracking, and private storage.' },
            { icon: <Search className="w-6 h-6 text-blue-600" />, title: 'Powerful Search', desc: 'Search and filter resources by title, subject, category, file type, and more.' },
            { icon: <Shield className="w-6 h-6 text-navy-600" />, title: 'Role-Based Access', desc: 'Student, faculty, and admin roles with backend-enforced permissions and RLS.' },
            { icon: <BookOpen className="w-6 h-6 text-svcet-green" />, title: 'Preview & Download', desc: 'Secure file preview and download with signed URLs for authorized users only.' },
            { icon: <Lock className="w-6 h-6 text-blue-600" />, title: 'Private Storage', desc: 'Files stored privately with authorization checks — no public URLs for academic content.' },
          ].map((f, i) => (
            <div key={i} className="card p-6">
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-navy-900 mb-10">Built for Everyone</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <GraduationCap className="w-8 h-8 text-blue-600" />, title: 'Students', desc: 'Browse departments, find notes, bookmark resources, and download securely.' },
              { icon: <Upload className="w-8 h-8 text-svcet-green" />, title: 'Faculty', desc: 'Upload materials, create subjects, manage uploads within authorized departments.' },
              { icon: <Shield className="w-8 h-8 text-navy-600" />, title: 'Administrators', desc: 'Manage academic structure, users, permissions, moderation, and audit logs.' },
            ].map((r, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  {r.icon}
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{r.title}</h3>
                <p className="text-sm text-slate-600">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-slate-300 mb-8">
            Register now to access academic resources or log in if you already have an account.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-accent text-base px-6 py-3">Register Now</Link>
            <Link to="/login" className="btn-secondary text-base px-6 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20">
              Login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
