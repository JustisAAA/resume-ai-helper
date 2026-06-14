import { useEffect, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom'
import { interviewAPI, resumeAPI, UserProfile, Interview } from '../services/api'
import { getApiBaseUrl } from '../utils/api'
import { getImageUrl } from '../utils/image'
import ErrorAlert from '../components/ErrorAlert'

/* ── 图标组件 ── */

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const InterviewIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
)

const ReportIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const BoltIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
)

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3 3 0 00-3-3H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const ScoreIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.809l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const GuideIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const TemplateIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
)

const MatchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
)

const OptimizeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
)

const QuestionIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

/* ── 卡片配色映射 ── */
const CARD_STYLE: Record<string, {
  gradientBar: string
  hoverCircleBg: string
  iconGradient: string
  shadow: string
  hoverTitle: string
  hoverTextColor: string
  arrowColor: string
}> = {
  'upload': {
    gradientBar: 'from-brand-400 via-brand-500 to-brand-600',
    hoverCircleBg: 'bg-brand-50',
    iconGradient: 'from-brand-500 to-brand-600',
    shadow: 'shadow-brand-500/25',
    hoverTitle: 'group-hover:text-brand-600 dark:group-hover:text-brand-400',
    hoverTextColor: 'text-brand-600',
    arrowColor: 'text-brand-600',
  },
  'score': {
    gradientBar: 'from-amber-400 via-amber-500 to-orange-500',
    hoverCircleBg: 'bg-amber-50',
    iconGradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/25',
    hoverTitle: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    hoverTextColor: 'text-amber-600',
    arrowColor: 'text-amber-600',
  },
  'guide': {
    gradientBar: 'from-brand-400 via-brand-500 to-brand-500',
    hoverCircleBg: 'bg-brand-50',
    iconGradient: 'from-brand-500 to-brand-500',
    shadow: 'shadow-brand-500/25',
    hoverTitle: 'group-hover:text-brand-600 dark:group-hover:text-brand-400',
    hoverTextColor: 'text-brand-600',
    arrowColor: 'text-brand-600',
  },
  'template': {
    gradientBar: 'from-brand-400 via-brand-500 to-brand-500',
    hoverCircleBg: 'bg-violet-50',
    iconGradient: 'from-violet-500 to-purple-500',
    shadow: 'shadow-brand-500/25',
    hoverTitle: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
    hoverTextColor: 'text-violet-600',
    arrowColor: 'text-violet-600',
  },
  'match': {
    gradientBar: 'from-rose-400 via-rose-500 to-pink-500',
    hoverCircleBg: 'bg-rose-50',
    iconGradient: 'from-rose-500 to-pink-500',
    shadow: 'shadow-rose-500/25',
    hoverTitle: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
    hoverTextColor: 'text-rose-600',
    arrowColor: 'text-rose-600',
  },
  'optimize': {
    gradientBar: 'from-amber-400 via-amber-500 to-amber-600',
    hoverCircleBg: 'bg-amber-50',
    iconGradient: 'from-amber-500 to-amber-600',
    shadow: 'shadow-amber-500/25',
    hoverTitle: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    hoverTextColor: 'text-amber-600',
    arrowColor: 'text-amber-600',
  },
  'question': {
    gradientBar: 'from-cyan-400 via-cyan-500 to-brand-500',
    hoverCircleBg: 'bg-cyan-50',
    iconGradient: 'from-cyan-500 to-brand-500',
    shadow: 'shadow-cyan-500/25',
    hoverTitle: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    hoverTextColor: 'text-cyan-600',
    arrowColor: 'text-cyan-600',
  },
  'interview': {
    gradientBar: 'from-purple-400 via-purple-500 to-purple-600',
    hoverCircleBg: 'bg-purple-50',
    iconGradient: 'from-brand-500 to-brand-600',
    shadow: 'shadow-brand-500/25',
    hoverTitle: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    hoverTextColor: 'text-purple-600',
    arrowColor: 'text-purple-600',
  },
  'report': {
    gradientBar: 'from-brand-400 via-brand-500 to-brand-600',
    hoverCircleBg: 'bg-brand-50',
    iconGradient: 'from-brand-500 to-brand-600',
    shadow: 'shadow-brand-500/25',
    hoverTitle: 'group-hover:text-brand-600 dark:group-hover:text-brand-400',
    hoverTextColor: 'text-brand-600',
    arrowColor: 'text-brand-600',
  },
}

const FEATURE_KEYS = ['upload', 'interview', 'report', 'score', 'guide', 'template', 'match', 'optimize', 'question'] as const

const FEATURE_CARDS = FEATURE_KEYS.map((key) => {
  const s = CARD_STYLE[key]
  const hrefs: Record<typeof key, { title: string; desc: string; path: string; icon: React.FC<{ className?: string }> }> = {
    upload:    { title: '上传简历',   desc: 'AI 智能分析简历内容，给出优化建议和评分', path: '/resumes/upload',  icon: UploadIcon },
    interview: { title: '开始面试',   desc: '基于简历生成个性化面试题，AI 实时评估表现', path: '/interviews/new', icon: InterviewIcon },
    report:    { title: '查看报告',   desc: '回顾面试表现，查看多维度评估报告和评分', path: '/reports',        icon: ReportIcon },
    score:     { title: '简历评分',   desc: 'AI 多维度评分，诊断简历短板，给出改进建议', path: '/tools/score',   icon: ScoreIcon },
    guide:     { title: '求职攻略',   desc: 'AI 提供求职全阶段实用建议和工具',     path: '/tools/guide',   icon: GuideIcon },
    template:   { title: '简历模板',   desc: '5款专业模板，一键生成精美简历',      path: '/templates',      icon: TemplateIcon },
    match:     { title: '人岗匹配',   desc: '上传简历和岗位JD，AI 分析匹配度',   path: '/tools/match',   icon: MatchIcon },
    optimize:   { title: '简历优化',   desc: 'AI 智能优化简历文案，支持多种模式',   path: '/tools/optimize', icon: OptimizeIcon },
    question:   { title: '面试问题',   desc: '根据简历和JD，AI 预测面试问题',    path: '/tools/questions', icon: QuestionIcon },
  }
  return { key, ...hrefs[key], ...s }
})

/* ── 主组件 ── */
export default function PracticePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({ resumes: 0, interviews: 0, reports: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) { navigate('/login'); return }
    let parsed: UserProfile | null = null
    try { parsed = JSON.parse(userStr); setUser(parsed) } catch { localStorage.removeItem('user'); navigate('/login'); return }
    if (parsed?.role === 'ADMIN') { navigate('/admin'); return }
    if (parsed?.role === 'ENTERPRISE') { navigate('/enterprise/dashboard'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [interviewData, resumes] = await Promise.all([
        interviewAPI.list(token!, 'PRACTICE').catch(() => ({ interviews: [] })),
        resumeAPI.list(token!).catch(() => [] as never[]),
      ])
      const interviews = (interviewData as any).interviews || []
      const reports = interviews.filter((iv: Interview) => iv.status === 'COMPLETED').length
      setStats({ resumes: resumes.length, interviews: interviews.length, reports })
    } catch (e: unknown) {
      const errObj = e as { response?: { data?: { error?: string } } }
      setError(errObj.response?.data?.error || '加载数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
              title="返回首页"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-sm">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg">简历面试AI助手</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{user?.name || user?.email}</span>
            <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-100 to-brand-100 dark:from-brand-900/30 dark:to-brand-900/30 flex items-center justify-center text-sm font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50 hover:shadow-md transition-all cursor-pointer overflow-hidden">
              {user?.avatar ? (
                <img src={getImageUrl(user.avatar)} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                (user?.name || user?.email || '?')[0].toUpperCase()
              )}
            </button>
<ThemeToggle />

            <button onClick={handleLogout} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              退出
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="relative">
        {/* 背景装饰 */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-brand-200/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 错误提示 */}
          {error && (
            <div className="mb-6">
              <ErrorAlert message={error} onRetry={() => { setError(''); setLoading(true); fetchData() }} />
            </div>
          )}

          {/* 欢迎区 */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              你好，{user?.name || '同学'} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base mt-1">
              准备好提升求职竞争力了吗？
            </p>
          </div>

          {/* 9个功能卡片 - 三行三列 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {FEATURE_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <button
                  key={card.key}
                  onClick={() => navigate(card.path)}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full overflow-hidden border border-gray-100 dark:border-gray-800"
                >
                  {/* 顶部渐变色条 */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradientBar}`} />
                  {/* hover 装饰圆 */}
                  <div className={`absolute -right-4 -top-4 w-20 h-20 ${card.hoverCircleBg} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    {/* 图标 */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.iconGradient} flex items-center justify-center mb-4 shadow-lg ${card.shadow} group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {/* 标题 */}
                    <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-1 ${card.hoverTitle}`}>
                      {card.title}
                    </h3>
                    {/* 描述 */}
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2 overflow-hidden">
                      {card.desc}
                    </p>
                    {/* 操作提示 */}
                    <div className={`flex items-center gap-1.5 ${card.hoverTextColor} font-medium text-sm group-hover:gap-2.5 transition-all duration-200`}>
                      <span>开始</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* 简历 */}
            <button
              onClick={() => navigate('/resumes')}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:border-brand-100 transition-all duration-300 text-left w-full overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-t-2xl" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">简历数量</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '-' : stats.resumes}</p>
                  <p className="text-xs text-brand-600 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    管理简历 →
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 group-hover:scale-110 transition-all duration-200">
                  <DocumentIcon className="w-6 h-6 text-brand-600" />
                </div>
              </div>
            </button>

            {/* 面试 */}
            <button
              onClick={() => navigate('/interviews')}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:border-purple-100 transition-all duration-300 text-left w-full overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-t-2xl" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">面试次数</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '-' : stats.interviews}</p>
                  <p className="text-xs text-purple-600 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    查看面试 →
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 group-hover:scale-110 transition-all duration-200">
                  <InterviewIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </button>

            {/* 报告 */}
            <button
              onClick={() => navigate('/reports')}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:border-brand-100 transition-all duration-300 text-left w-full overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-t-2xl" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">面试报告</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '-' : stats.reports}</p>
                  <p className="text-xs text-brand-600 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    查看报告 →
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 group-hover:scale-110 transition-all duration-200">
                  <ReportIcon className="w-6 h-6 text-brand-600" />
                </div>
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
