import type { JSX } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ResumeList from './pages/ResumeList'
import ResumeUpload from './pages/ResumeUpload'
import ResumeDetail from './pages/ResumeDetail'
import InterviewList from './pages/InterviewList'
import InterviewNew from './pages/InterviewNew'
import InterviewRoom from './pages/InterviewRoom'
import InterviewReport from './pages/InterviewReport'
import ReportCenter from './pages/ReportCenter'
import ToolsOptimize from './pages/ToolsOptimize'
import ToolsMatch from './pages/ToolsMatch'
import ToolsQuestions from './pages/ToolsQuestions'
import ToolsScore from './pages/ToolsScore'
import ToolsGuide from './pages/ToolsGuide'
import Templates from './pages/Templates'
import TemplateApply from './pages/TemplateApply'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminResumes from './pages/AdminResumes'
import AdminInterviews from './pages/AdminInterviews'
import AdminReports from './pages/AdminReports'

/* ── 路由守卫 ── */

function getUser() {
  try {
    const str = localStorage.getItem('user')
    return str ? JSON.parse(str) : null
  } catch {
    return null
  }
}

/** 普通用户路由：管理员自动重定向到 /admin */
function UserRoute({ children }: { children: JSX.Element }) {
  const user = getUser()
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />
  return children
}

/** 管理员路由：非管理员或未登录重定向 */
function AdminRoute({ children }: { children: JSX.Element }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

/** 已登录路由：已登录用户访问登录/注册页自动跳转 */
function GuestRoute({ children }: { children: JSX.Element }) {
  const user = getUser()
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      {/* 公开页面 */}
      <Route path="/" element={<Home />} />

      {/* 未登录才能访问 */}
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

      {/* 普通用户页面（管理员会被踢到 /admin） */}
      <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
      <Route path="/resumes" element={<UserRoute><ResumeList /></UserRoute>} />
      <Route path="/resumes/upload" element={<UserRoute><ResumeUpload /></UserRoute>} />
      <Route path="/resumes/:id" element={<UserRoute><ResumeDetail /></UserRoute>} />
      <Route path="/interviews" element={<UserRoute><InterviewList /></UserRoute>} />
      <Route path="/interviews/new" element={<UserRoute><InterviewNew /></UserRoute>} />
      <Route path="/interviews/:id/room" element={<UserRoute><InterviewRoom /></UserRoute>} />
      <Route path="/interviews/:id/report" element={<UserRoute><InterviewReport /></UserRoute>} />
      <Route path="/reports" element={<UserRoute><ReportCenter /></UserRoute>} />
      <Route path="/tools/optimize" element={<UserRoute><ToolsOptimize /></UserRoute>} />
      <Route path="/tools/match" element={<UserRoute><ToolsMatch /></UserRoute>} />
      <Route path="/tools/questions" element={<UserRoute><ToolsQuestions /></UserRoute>} />
      <Route path="/tools/score" element={<UserRoute><ToolsScore /></UserRoute>} />
      <Route path="/tools/guide" element={<UserRoute><ToolsGuide /></UserRoute>} />
      <Route path="/templates" element={<UserRoute><Templates /></UserRoute>} />
      <Route path="/templates/:id/apply" element={<UserRoute><TemplateApply /></UserRoute>} />
      <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />

      {/* 管理员页面（普通用户会被踢走） */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/resumes" element={<AdminRoute><AdminResumes /></AdminRoute>} />
      <Route path="/admin/interviews" element={<AdminRoute><AdminInterviews /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
