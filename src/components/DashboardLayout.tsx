import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import {
  LayoutDashboard, FolderTree, Upload, FileText, Users, Settings,
  Shield, Bookmarks, LogOut, Menu, X, ScrollText, FolderOpen, User,
  GraduationCap, ClipboardList, BookOpen,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

export default function DashboardLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const role = profile?.role ?? 'student'

  const navItems: Record<string, NavItem[]> = {
    student: [
      { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/student/departments', label: 'Browse Resources', icon: <FolderTree className="w-4 h-4" /> },
      { to: '/student/bookmarks', label: 'Bookmarks', icon: <Bookmarks className="w-4 h-4" /> },
      { to: '/student/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    ],
    faculty: [
      { to: '/staff/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/staff/upload', label: 'Upload Resource', icon: <Upload className="w-4 h-4" /> },
      { to: '/staff/resources', label: 'My Uploads', icon: <FileText className="w-4 h-4" /> },
      { to: '/staff/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/admin/departments', label: 'Departments', icon: <FolderOpen className="w-4 h-4" /> },
      { to: '/admin/academic-years', label: 'Academic Years', icon: <GraduationCap className="w-4 h-4" /> },
      { to: '/admin/semesters', label: 'Semesters', icon: <ClipboardList className="w-4 h-4" /> },
      { to: '/admin/subjects', label: 'Subjects', icon: <BookOpen className="w-4 h-4" /> },
      { to: '/admin/categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
      { to: '/admin/resources', label: 'Resources', icon: <FileText className="w-4 h-4" /> },
      { to: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
      { to: '/admin/permissions', label: 'Permissions', icon: <Shield className="w-4 h-4" /> },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: <ScrollText className="w-4 h-4" /> },
      { to: '/admin/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    ],
  }

  const items = navItems[role] ?? []
  const basePath = role === 'admin' ? '/admin' : role === 'faculty' ? '/staff' : '/student'

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-slate-600"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/assets/digitalink-svcet-shield.svg" alt="SVCET Shield" className="w-8 h-8" />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-navy-900">Digitalink</span>
                <span className="text-[10px] text-slate-500 -mt-0.5">SVCET Academic Resources</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-700">{profile?.full_name}</span>
              <span className="badge-navy capitalize">{profile?.role}</span>
            </span>
            <button onClick={handleLogout} className="btn-ghost text-sm">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-64' : 'hidden'
          } lg:block lg:static lg:w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)]`}
        >
          <div className="p-4">
            {sidebarOpen && (
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <span className="font-semibold text-slate-700">Menu</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            )}
            <nav className="space-y-1">
              {items.map((item) => {
                const active = location.pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-navy-700 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Sri Venkateshwaraa College of Engineering &amp; Technology — Ariyur, Puducherry
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
