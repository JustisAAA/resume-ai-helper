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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/resumes" element={<ResumeList />} />
      <Route path="/resumes/upload" element={<ResumeUpload />} />
      <Route path="/resumes/:id" element={<ResumeDetail />} />
      <Route path="/interviews" element={<InterviewList />} />
      <Route path="/interviews/new" element={<InterviewNew />} />
      <Route path="/interviews/:id/room" element={<InterviewRoom />} />
      <Route path="/interviews/:id/report" element={<InterviewReport />} />
      <Route path="/reports" element={<ReportCenter />} />
      <Route path="/tools/optimize" element={<ToolsOptimize />} />
      <Route path="/tools/match" element={<ToolsMatch />} />
      <Route path="/tools/questions" element={<ToolsQuestions />} />
      <Route path="/tools/score" element={<ToolsScore />} />
      <Route path="/tools/guide" element={<ToolsGuide />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/templates/:id/apply" element={<TemplateApply />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/resumes" element={<AdminResumes />} />
      <Route path="/admin/interviews" element={<AdminInterviews />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
