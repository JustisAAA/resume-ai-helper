import { useState, useEffect } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom'
import { enterpriseAPI, jobAPI } from '../services/api'
import { getApiBaseUrl } from '../utils/api'
import { getImageUrl } from '../utils/image'
import Loading from '../components/Loading'
import ErrorAlert from '../components/ErrorAlert'
import {
  BuildingOfficeIcon, PlusIcon, ChatBubbleLeftEllipsisIcon,
  BriefcaseIcon, UsersIcon, ChartBarIcon,
  MapPinIcon, TagIcon, UserGroupIcon, GlobeAltIcon, EnvelopeIcon,
  PhoneIcon, PencilIcon, ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'

/* ── 卡片配色映射 ── */
const CARD_STYLE: Record<string, {
  gradientBar: string
  hoverCircleBg: string
  iconGradient: string
  shadow: string
  hoverTitle: string
  hoverTextColor: string
}> = {
  'job-new': {
    gradientBar: 'from-brand-400 via-brand-500 to-brand-600',
    hoverCircleBg: 'bg-violet-50 dark:bg-violet-900/20',
    iconGradient: 'from-brand-500 to-brand-600',
    shadow: 'shadow-brand-500/25',
    hoverTitle: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
    hoverTextColor: 'text-violet-600 dark:text-violet-400',
  },
  'manage': {
    gradientBar: 'from-blue-400 via-blue-500 to-cyan-500',
    hoverCircleBg: 'bg-blue-50 dark:bg-blue-900/20',
    iconGradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/25',
    hoverTitle: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    hoverTextColor: 'text-blue-600 dark:text-blue-400',
  },
  'hr-messages': {
    gradientBar: 'from-pink-400 via-rose-500 to-pink-500',
    hoverCircleBg: 'bg-pink-50 dark:bg-pink-900/20',
    iconGradient: 'from-pink-500 to-rose-500',
    shadow: 'shadow-pink-500/25',
    hoverTitle: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
    hoverTextColor: 'text-pink-600 dark:text-pink-400',
  },
  'analytics': {
    gradientBar: 'from-brand-400 via-brand-500 to-brand-600',
    hoverCircleBg: 'bg-brand-50 dark:bg-brand-900/20',
    iconGradient: 'from-brand-500 to-brand-600',
    shadow: 'shadow-brand-500/25',
    hoverTitle: 'group-hover:text-brand-600 dark:group-hover:text-brand-400',
    hoverTextColor: 'text-brand-600 dark:text-brand-400',
  },
}

const FEATURE_CARDS = [
  { key: 'job-new', title: '发布新职位', desc: '创建新的招聘职位', path: '/enterprise/jobs/new', icon: PlusIcon },
  { key: 'manage', title: '管理职位', desc: '查看和编辑现有职位', path: '/enterprise/jobs', icon: BriefcaseIcon },
  { key: 'hr-messages', title: 'HR消息', desc: '与HR子账号内部沟通', path: '/enterprise/messages', icon: ChatBubbleLeftEllipsisIcon },
  { key: 'analytics', title: '数据分析', desc: '查看招聘数据图表', path: '/enterprise/analytics', icon: ChartBarIcon },
]

export default function EnterpriseDashboard() {
  const navigate = useNavigate()
const [enterprise, setEnterprise] = useState<any>(null)
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalApplications: 0 })
  const [creditScore, setCreditScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) { navigate('/enterprise/login'); return }
      const enterpriseRes = await enterpriseAPI.getProfile(token)
      setEnterprise(enterpriseRes.enterprise)
      const jobsRes = await jobAPI.list({ enterpriseId: enterpriseRes.enterprise.id })
      const jobs = jobsRes.jobs || []
      setStats({
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j: any) => j.status === 'ACTIVE').length,
        totalApplications: jobs.reduce((s: number, j: any) => s + (j._count?.applications || 0), 0),
      })
      try {
        const cr = await fetch(`${getApiBaseUrl()}/api/users/me/credit`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (cr.ok) {
          const cd = await cr.json()
          setCreditScore(cd.creditScore)
        }
      } catch { }
    } catch (err: any) {
      setError(err.response?.data?.error || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/enterprise/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="sm" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 顶部导航 */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-sm">
              <BuildingOfficeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">简历面试AI助手企业端</span>
          </div>
          <div className="flex items-center gap-2">
<ThemeToggle />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="relative">
        {/* 背景装饰 */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-pink-200/15 dark:bg-pink-900/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && <ErrorAlert message={error} onRetry={loadData} />}

          {/* ========== 企业信息头部 ========== */}
          {enterprise && (
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 p-6 mb-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-100/60 to-brand-100/60 dark:from-brand-900/10 dark:to-brand-900/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-brand-100/40 to-brand-100/40 dark:from-brand-900/10 dark:to-brand-900/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row items-start gap-6">
                <div className="shrink-0">
                  {enterprise.logo ? (
                    <img
                      src={getImageUrl(enterprise.logo)}
                      alt={enterprise.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white dark:border-gray-700 shadow-lg"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
                      <BuildingOfficeIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {enterprise.name}
                  </h1>
                  {enterprise.description && (
                    <p className="text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                      {enterprise.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {enterprise.industry && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full">
                        <TagIcon className="w-3.5 h-3.5" />
                        {enterprise.industry}
                      </span>
                    )}
                    {enterprise.size && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                        <UserGroupIcon className="w-3.5 h-3.5" />
                        {enterprise.size}
                      </span>
                    )}
                    {enterprise.location && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        {enterprise.location}
                      </span>
                    )}
                    {enterprise.website && (
                      <a
                        href={enterprise.website.startsWith('http') ? enterprise.website : `https://${enterprise.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-full hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                      >
                        <GlobeAltIcon className="w-3.5 h-3.5" />
                        {enterprise.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    {enterprise.contactEmail && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full">
                        <EnvelopeIcon className="w-3.5 h-3.5" />
                        {enterprise.contactEmail}
                      </span>
                    )}
                    {enterprise.contactPhone && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-full">
                        <PhoneIcon className="w-3.5 h-3.5" />
                        {enterprise.contactPhone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/enterprise/profile')}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <PencilIcon className="w-4 h-4" />
                    编辑资料
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm border ${
                      creditScore !== null 
                        ? creditScore >= 80 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                          : creditScore >= 60
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    信用分{creditScore !== null ? ` ${creditScore}` : ''}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 欢迎区 */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              你好，{enterprise?.name || '企业'} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base mt-1">
              管理企业招聘和AI面试流程
            </p>
          </div>

          {/* 4个功能卡片 - 2行2列 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {FEATURE_CARDS.map((card) => {
              const s = CARD_STYLE[card.key]
              const Icon = card.icon
              return (
                <button
                  key={card.key}
                  onClick={() => navigate(card.path)}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full overflow-hidden border border-gray-100 dark:border-gray-800"
                >
                  {/* 顶部渐变色条 */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.gradientBar}`} />
                  {/* hover 装饰圆 */}
                  <div className={`absolute -right-4 -top-4 w-20 h-20 ${s.hoverCircleBg} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    {/* 图标 */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.iconGradient} flex items-center justify-center mb-4 shadow-lg ${s.shadow} group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {/* 标题 */}
                    <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-1 ${s.hoverTitle}`}>
                      {card.title}
                    </h3>
                    {/* 描述 */}
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                      {card.desc}
                    </p>
                    {/* 操作提示 */}
                    <div className={`flex items-center gap-1.5 ${s.hoverTextColor} font-medium text-sm group-hover:gap-2.5 transition-all duration-200`}>
                      <span>进入</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* 职位总数 */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:border-purple-100 dark:hover:border-purple-800 transition-all duration-300 text-left w-full overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-t-2xl" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">职位总数</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalJobs}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:scale-110 transition-all duration-200">
                  <BriefcaseIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* 活跃职位 */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:border-brand-100 dark:hover:border-brand-800 transition-all duration-300 text-left w-full overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-t-2xl" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">活跃职位</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeJobs}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 group-hover:scale-110 transition-all duration-200">
                  <ChartBarIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
              </div>
            </div>

            {/* 总申请数 */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:border-brand-100 dark:hover:border-brand-800 transition-all duration-300 text-left w-full overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-t-2xl" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">总申请数</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 group-hover:scale-110 transition-all duration-200">
                  <UsersIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
