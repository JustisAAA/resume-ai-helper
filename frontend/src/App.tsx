import type { JSX } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import Loading from './components/Loading'

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
const EnterpriseMessages = lazy(() => import('./pages/EnterpriseMessages'))
const EnterpriseProfileEdit = lazy(() => import('./pages/EnterpriseProfileEdit'))
const PracticePage = lazy(() => import('./pages/PracticePage'))
const JobList = lazy(() => import('./pages/JobList'))
const JobDetail = lazy(() => import('./pages/JobDetail'))
const JobApply = lazy(() => import('./pages/JobApply'))
const MessageList = lazy(() => import('./pages/MessageList'))
const MessageWindow = lazy(() => import('./pages/MessageWindow'))
const MyApplications = lazy(() => import('./pages/MyApplications'))
const AdminReports = lazy(() => import('./pages/AdminReports'))
const HRLogin = lazy(() => import('./pages/HRLogin'))
const HRDashboard = lazy(() => import('./pages/HRDashboard'))
const HRApplications = lazy(() => import('./pages/HRApplications'))
const HRResumeDetail = lazy(() => import('./pages/HRResumeDetail'))
const HRMessages = lazy(() => import('./pages/HRMessages'))
const HRSettings = lazy(() => import('./pages/HRSettings'))
const HRInterviews = lazy(() => import('./pages/HRInterviews'))
const MyEnterpriseInterviews = lazy(() => import('./pages/MyEnterpriseInterviews'))
const EnterpriseInterviewRoom = lazy(() => import('./pages/EnterpriseInterviewRoom'))
const BannedPage = lazy(() => import('./pages/BannedPage'))

/* ── 路由守卫 ── */

function getUser() {
  try {
    const str = localStorage.getItem('user')
    return str ? JSON.parse(str) : null
  } catch {
    return null
  }
}

/** 普通用户路由：管理员重定向到 /admin，企业用户重定向到 /enterprise/dashboard */
function UserRoute({ children }: { children: JSX.Element }) {
  const user = getUser()
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />
  if (user?.role === 'ENTERPRISE') return <Navigate to="/enterprise/dashboard" replace />
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
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
  if (user.role !== 'ENTERPRISE') return <Navigate to="/dashboard" replace />
  return children
}

/** HR路由：非HR用户或未登录重定向 */
function HRRoute({ children }: { children: JSX.Element }) {
  const hrToken = localStorage.getItem('hrToken');
  if (!hrToken) return <Navigate to="/hr/login" replace />;
  // 验证 token 对应的用户角色确实是 HR
  try {
    const hrUser = JSON.parse(localStorage.getItem('hrUser') || '{}');
    if (!hrUser.id || hrUser.role !== 'HR') {
      localStorage.removeItem('hrToken');
      localStorage.removeItem('hrUser');
      return <Navigate to="/hr/login" replace />;
    }
  } catch {
    localStorage.removeItem('hrToken');
    localStorage.removeItem('hrUser');
    return <Navigate to="/hr/login" replace />;
  }
  return children;
}

/** 已登录路由：已登录用户访问登录/注册页自动跳转 */
function GuestRoute({ children }: { children: JSX.Element }) {
  const user = getUser()
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
    if (user.role === 'ENTERPRISE') return <Navigate to="/enterprise/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function App() {
  // 根据当前登录用户设置主题角色
  useEffect(() => {
    function updateRole() {
      const hrToken = localStorage.getItem('hrToken');
      const hrUserStr = localStorage.getItem('hrUser');
      const userStr = localStorage.getItem('user');

      let role: string | null = null;

      // HR 页面强制使用 HR 主题（不论登录状态）
      if (window.location.pathname.startsWith('/hr/')) {
        role = 'hr';
      }

      // HR 用户优先（已登录）
      if (!role && hrToken && hrUserStr) {
        try {
          const hrUser = JSON.parse(hrUserStr);
          if (hrUser.role === 'HR') {
            role = 'hr';
          }
        } catch {}
      }

      // 普通用户或企业用户
      if (!role && userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'ENTERPRISE') {
            role = 'enterprise';
          } else if (user.role === 'ADMIN') {
            role = 'enterprise'; // 管理员暂用企业端主题
          } else {
            role = 'jobseeker';
          }
        } catch {}
      }

      // 未登录，使用默认主题
      if (!role) {
        role = 'jobseeker';
      }

      document.documentElement.dataset.role = role;
    }

    updateRole();

    // 监听 localStorage 变化（跨标签页登录/登出）
    window.addEventListener('storage', updateRole);
    return () => window.removeEventListener('storage', updateRole);
  }, []);

  return (
    <Suspense fallback={<Loading fullScreen size="lg" text="页面加载中..." />}>
    <BannedPage />
    <Routes>
      {/* 公开页面 */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<JobSeekerHome />} />
      <Route path="/role-select" element={<Home />} />

      {/* 未登录才能访问 */}
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

      {/* 普通用户页面（管理员会被踢到 /admin） */}
      <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
      <Route path="/practice" element={<UserRoute><PracticePage /></UserRoute>} />
      <Route path="/resumes" element={<UserRoute><ResumeList /></UserRoute>} />
      <Route path="/resumes/upload" element={<UserRoute><ResumeUpload /></UserRoute>} />
      <Route path="/resumes/:id" element={<UserRoute><ResumeDetail /></UserRoute>} />
      <Route path="/interviews" element={<UserRoute><InterviewList /></UserRoute>} />
      <Route path="/interviews/new" element={<UserRoute><InterviewNew /></UserRoute>} />
      <Route path="/interviews/:id/guide" element={<UserRoute><InterviewGuide /></UserRoute>} />
      <Route path="/interviews/:id/room" element={<UserRoute><InterviewRoom /></UserRoute>} />
      <Route path="/interviews/:id/enterprise-room" element={<UserRoute><EnterpriseInterviewRoom /></UserRoute>} />
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
      <Route path="/jobs" element={<UserRoute><JobList /></UserRoute>} />
      <Route path="/jobs/:id" element={<UserRoute><JobDetail /></UserRoute>} />
      <Route path="/jobs/:id/apply" element={<UserRoute><JobApply /></UserRoute>} />
      <Route path="/my-applications" element={<UserRoute><MyApplications /></UserRoute>} />
      <Route path="/messages" element={<UserRoute><MessageList /></UserRoute>} />
      <Route path="/messages/:partnerId" element={<UserRoute><MessageWindow /></UserRoute>} />
      <Route path="/enterprise-interviews" element={<UserRoute><MyEnterpriseInterviews /></UserRoute>} />

      {/* 管理员页面（普通用户会被踢走） */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

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
      <Route path="/enterprise/messages" element={<EnterpriseRoute><EnterpriseMessages /></EnterpriseRoute>} />
      <Route path="/enterprise/messages/:userId" element={<EnterpriseRoute><EnterpriseMessages /></EnterpriseRoute>} />
      <Route path="/enterprise/profile" element={<EnterpriseRoute><EnterpriseProfileEdit /></EnterpriseRoute>} />

      {/* HR 路由 */}
      <Route path="/hr/login" element={<HRLogin />} />
      <Route path="/hr/dashboard" element={<HRRoute><HRDashboard /></HRRoute>} />
      <Route path="/hr/applications" element={<HRRoute><HRApplications /></HRRoute>} />
      <Route path="/hr/applications/:applicationId/resume" element={<HRRoute><HRResumeDetail /></HRRoute>} />
      <Route path="/hr/messages" element={<HRRoute><HRMessages /></HRRoute>} />
      <Route path="/hr/settings" element={<HRRoute><HRSettings /></HRRoute>} />
      <Route path="/hr/interviews" element={<HRRoute><HRInterviews /></HRRoute>} />
      <Route path="/hr/interviews/:interviewId/report" element={<HRRoute><EnterpriseInterviewReport /></HRRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  )
}

export default App
