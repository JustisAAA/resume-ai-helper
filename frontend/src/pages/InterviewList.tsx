import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { interviewAPI, Interview } from '../services/api'
import { useToast } from '../components/Toast'
import ErrorAlert from '../components/ErrorAlert'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'


export default function InterviewList() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ total: 0, completed: 0, avgScore: 0, totalDuration: 0 })
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => { fetchInterviews() }, [])

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('token')
      const data = await interviewAPI.list(token!, 'PRACTICE') as any
      const interviews = data.interviews || []
      // 后端没有 duration 字段，根据 startedAt 和 completedAt 实时计算
      const processed = interviews.map((iv: Interview) => {
        if (!iv.duration && iv.startedAt && iv.completedAt) {
          const start = new Date(iv.startedAt).getTime();
          const end = new Date(iv.completedAt).getTime();
          iv.duration = Math.max(0, Math.round((end - start) / 1000));
        }
        return iv;
      });
      setInterviews(processed)

      // 计算统计
      const completed = processed.filter((iv: Interview) => iv.status === 'COMPLETED')
      const totalScore = completed.reduce((sum: number, iv: Interview) => sum + (iv.score || 0), 0)
      const totalDuration = completed.reduce((sum: number, iv: Interview) => sum + (iv.duration || 0), 0)
      setStats({
        total: processed.length,
        completed: completed.length,
        avgScore: completed.length > 0 ? Math.round(totalScore / completed.length) : 0,
        totalDuration
      })
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      setError(errObj.response?.data?.error || '获取面试列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这场面试记录吗？')) return
    try {
      const token = localStorage.getItem('token')
      await interviewAPI.delete(token!, id)
      fetchInterviews()
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      showToast(errObj.response?.data?.error || '删除失败', 'error')
    }
  }

  const difficultyConfig: Record<string, { color: string; label: string; bg: string }> = {
    EASY: { color: 'text-green-700 dark:text-green-300', label: '简单', bg: 'bg-green-50 dark:bg-green-900/30' },
    HARD: { color: 'text-red-700 dark:text-red-300', label: '困难', bg: 'bg-red-50 dark:bg-red-900/30' },
    MEDIUM: { color: 'text-yellow-700 dark:text-yellow-300', label: '中等', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}分${s}秒`
  }

  if (loading) return <Loading fullScreen size="md" text="加载面试记录..." />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/practice')}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="返回"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">简历面试AI助手</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和统计 */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">模拟面试</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">AI 驱动的模拟面试，提升你的面试表现</p>
          </div>
          <button
            onClick={() => navigate('/interviews/new')}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-600 text-white rounded-xl font-medium shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            开始新面试
          </button>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* 统计卡片 */}
        {interviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: '总面试数', value: stats.total, icon: '📊', color: 'from-brand-500 to-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/30' },
              { label: '已完成', value: stats.completed, icon: '✅', color: 'from-green-500 to-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
              { label: '平均得分', value: stats.avgScore ? `${stats.avgScore}分` : '--', icon: '⭐', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
              { label: '总时长', value: formatDuration(stats.totalDuration), icon: '⏱️', color: 'from-brand-500 to-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/30' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {interviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-brand-100 to-brand-100 dark:from-brand-900/30 dark:to-brand-900/30 flex items-center justify-center shadow-inner">
              <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">开始你的第一场模拟面试吧</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">AI 将基于你的简历生成个性化面试题，实时评估表现并给出详细报告</p>
            <button
              onClick={() => navigate('/interviews/new')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-600 text-white rounded-xl font-medium hover:from-brand-700 hover:to-brand-700 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              开始新面试
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map(iv => {
              const dc = difficultyConfig[iv.difficulty as keyof typeof difficultyConfig] || difficultyConfig.MEDIUM
              const answerCount = iv.answers?.length || 0
              return (
                <div key={iv.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-600 transition-all duration-300 group">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-700 dark:text-brand-300 transition-colors">{iv.title}</h3>
                        <StatusBadge status={iv.status} type="interview" />
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dc.bg} ${dc.color}`}>{dc.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                        {iv.position && <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{iv.position}</span>}
                        {iv.score !== null && <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.808l-3.98 2.98a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.98-2.98a1 1 0 00-1.176 0l-3.98 2.98c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.98-2.98c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>{iv.score}分</span>}
                        {iv.status === 'COMPLETED' && iv.duration && <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{formatDuration(iv.duration)}</span>}
                        {iv.status === 'IN_PROGRESS' && <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>{answerCount}题已答</span>}
                        <span>{new Date(iv.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {iv.status === 'CREATED' && (
                        <button
                          onClick={() => navigate(`/interviews/${iv.id}/room`)}
                          className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-green-500 to-brand-600 text-white hover:from-green-600 hover:to-brand-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 009 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          开始面试
                        </button>
                      )}
                      {iv.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => navigate(`/interviews/${iv.id}/room`)}
                          className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.072a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          继续面试
                        </button>
                      )}
                      {iv.status === 'COMPLETED' && (
                        <button
                          onClick={() => navigate(`/interviews/${iv.id}/report`)}
                          className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          查看报告
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(iv.id)}
                        className="px-3 py-2 text-sm rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        title="删除"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
