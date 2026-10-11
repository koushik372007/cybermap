import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { isSupabaseConfigured } from './lib/supabase'

// Public
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'
import ResetPasswordPage from './pages/public/ResetPasswordPage'

// Student
import StudentDashboard from './pages/student/StudentDashboard'
import StudentDepartments from './pages/student/StudentDepartments'
import StudentDepartment from './pages/student/StudentDepartment'
import StudentSemester from './pages/student/StudentSemester'
import StudentSubject from './pages/student/StudentSubject'
import StudentResource from './pages/student/StudentResource'
import StudentBookmarks from './pages/student/StudentBookmarks'
import StudentProfile from './pages/student/StudentProfile'

// Staff
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffUpload from './pages/staff/StaffUpload'
import StaffResources from './pages/staff/StaffResources'
import StaffResourceEdit from './pages/staff/StaffResourceEdit'
import StaffProfile from './pages/staff/StaffProfile'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDepartments from './pages/admin/AdminDepartments'
import AdminAcademicYears from './pages/admin/AdminAcademicYears'
import AdminSemesters from './pages/admin/AdminSemesters'
import AdminSubjects from './pages/admin/AdminSubjects'
import AdminCategories from './pages/admin/AdminCategories'
import AdminResources from './pages/admin/AdminResources'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPermissions from './pages/admin/AdminPermissions'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'
import AdminSettings from './pages/admin/AdminSettings'

import ProtectedRoute from './components/ProtectedRoute'
import NotConfigured from './pages/public/NotConfigured'

export default function App() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <img src="/assets/digitalink-svcet-shield.svg" alt="Loading" className="w-16 h-16" />
          <p className="text-slate-400 text-sm">Loading Digitalink SVCET…</p>
        </div>
      </div>
    )
  }

  if (!isSupabaseConfigured) {
    return <NotConfigured />
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute role="student" />}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="departments" element={<StudentDepartments />} />
        <Route path="departments/:departmentId" element={<StudentDepartment />} />
        <Route path="semesters/:semesterId" element={<StudentSemester />} />
        <Route path="subjects/:subjectId" element={<StudentSubject />} />
        <Route path="resources/:resourceId" element={<StudentResource />} />
        <Route path="bookmarks" element={<StudentBookmarks />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Staff */}
      <Route path="/staff" element={<ProtectedRoute role="faculty" />}>
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="upload" element={<StaffUpload />} />
        <Route path="resources" element={<StaffResources />} />
        <Route path="resources/:resourceId/edit" element={<StaffResourceEdit />} />
        <Route path="profile" element={<StaffProfile />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin" />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="academic-years" element={<AdminAcademicYears />} />
        <Route path="semesters" element={<AdminSemesters />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="resources" element={<AdminResources />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="permissions" element={<AdminPermissions />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
