import type { JSX } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

/* ── 懒加载页面组件 ── */
const Home = lazy(() => import('./pages/Home'))
const Register = lazy(() => import('./pages/Register'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ResumeList = lazy(() => import('./pages/ResumeList'))
const ResumeUpload = lazy(() => import('./pages/ResumeUpload'))
const ResumeDetail = lazy(() => import('./pages/ResumeDetail'))
const InterviewList = lazy(() => import('./pages/InterviewList'))
const InterviewNew = lazy(() => import('./pages/InterviewNew'))
const InterviewRoom = lazy(() => import('./pages/InterviewRoom'))
const InterviewGuide = lazy(() => import('./pages/InterviewGuide'))
const InterviewReport = lazy(() => import('./pages/InterviewReport'))
const ReportCenter = lazy(() => import('./pages/ReportCenter'))
const ToolsOptimize = lazy(() => import('./pages/ToolsOptimize'))
const ToolsMatch = lazy(() => import('./pages/ToolsMatch'))
const ToolsQuestions = lazy(() => import('./pages/ToolsQuestions'))
const ToolsScore = lazy(() => import('./pages/ToolsScore'))
const ToolsGuide = lazy(() => import('./pages/ToolsGuide'))
const Templates = lazy(() => import('./pages/Templates'))
const TemplateApply = lazy(() => import('./pages/TemplateApply'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const EnterpriseLogin = lazy(() => import('./pages/EnterpriseLogin'))
const EnterpriseRegister = lazy(() => import('./pages/EnterpriseRegister'))
const EnterpriseDashboard = lazy(() => import('./pages/EnterpriseDashboard'))
const EnterpriseJobs = lazy(() => import('./pages/EnterpriseJobs'))
const EnterpriseJobEdit = lazy(() => import('./pages/EnterpriseJobEdit'))
const EnterpriseApplications = lazy(() => import('./pages/EnterpriseApplications'))
const EnterpriseResumeDetail = lazy(() => import('./pages/EnterpriseResumeDetail'))
const EnterpriseInterviewList = lazy(() => import('./pages/EnterpriseInterviewList'))
const EnterpriseInterviewReport = lazy(() => import('./pages/EnterpriseInterviewReport'))
const JobSeekerHome = lazy(() => import('./pages/JobSeekerHome'))
const EnterpriseMarketing = lazy(() => import('./pages/EnterpriseMarketing'))
const EnterpriseAnalytics = lazy(() => import('./pages/EnterpriseAnalytics'))

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

/** 企业路由：非企业用户或未登录重定向 */
function EnterpriseRoute({ children }: { children: JSX.Element }) {
  const user = getUser()
  if (!user) return <Navigate to="/enterprise/login" replace />
  if (user.role !== 'ENTERPRISE') return <Navigate to="/enterprise/login" replace />
  return children
}

/** 已登录路由：已登录用户访问登录/注册页自动跳转 */
function GuestRoute({ children }: { children: JSX.Element }) {
  const user = getUser()
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'ENTERPRISE' ? '/enterprise/dashboard' : '/dashboard'} replace />
  }
  return children
}

function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
    <Routes>
      {/* 公开页面 */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<JobSeekerHome />} />

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
      <Route path="/interviews/:id/guide" element={<UserRoute><InterviewGuide /></UserRoute>} />
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

      {/* 企业页面（普通用户会被踢走） */}
      <Route path="/enterprise" element={<Navigate to="/enterprise/marketing" replace />} />
      <Route path="/enterprise/marketing" element={<EnterpriseMarketing />} />
      <Route path="/enterprise/login" element={<GuestRoute><EnterpriseLogin /></GuestRoute>} />
      <Route path="/enterprise/register" element={<GuestRoute><EnterpriseRegister /></GuestRoute>} />
      <Route path="/enterprise/dashboard" element={<EnterpriseRoute><EnterpriseDashboard /></EnterpriseRoute>} />
      <Route path="/enterprise/jobs" element={<EnterpriseRoute><EnterpriseJobs /></EnterpriseRoute>} />
      <Route path="/enterprise/jobs/new" element={<EnterpriseRoute><EnterpriseJobEdit /></EnterpriseRoute>} />
      <Route path="/enterprise/jobs/:id/edit" element={<EnterpriseRoute><EnterpriseJobEdit /></EnterpriseRoute>} />
      <Route path="/enterprise/applications" element={<EnterpriseRoute><EnterpriseApplications /></EnterpriseRoute>} />
      <Route path="/enterprise/applications/:applicationId/resume" element={<EnterpriseRoute><EnterpriseResumeDetail /></EnterpriseRoute>} />
      <Route path="/enterprise/interviews" element={<EnterpriseRoute><EnterpriseInterviewList /></EnterpriseRoute>} />
      <Route path="/enterprise/interviews/:interviewId/report" element={<EnterpriseRoute><EnterpriseInterviewReport /></EnterpriseRoute>} />
      <Route path="/enterprise/analytics" element={<EnterpriseRoute><EnterpriseAnalytics /></EnterpriseRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  )
}

export default App
