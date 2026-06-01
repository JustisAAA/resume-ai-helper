import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { interviewAPI, Interview } from '../services/api'


export default function ReportCenter() {
  const { dark, toggleTheme } = useTheme()

  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchInterviews() }, [])

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await interviewAPI.list(token!)
      // 只保留已完成的面试
      const completed = res.filter((iv: Interview) => iv.status === 'COMPLETED')
      // 按时间倒序
      completed.sort((a: Interview, b: Interview) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setInterviews(completed)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '获取报告列表失败')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 text-green-700'
    if (score >= 60) return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700'
    return 'bg-red-50 dark:bg-red-900/20 text-red-700'
  }

  const getDifficultyLabel = (d: string) => d === 'EASY' ? '简单' : d === 'HARD' ? '困难' : '中等'
  const getDifficultyColor = (d: string) => d === 'EASY' ? 'text-green-600' : d === 'HARD' ? 'text-red-600' : 'text-yellow-600'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">加载报告...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">面试报告中心</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/interviews')}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium"
            >
              去面试
            </button>
            <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title={dark ? '浅色模式' : '深色模式'}>
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 17.657l-.707-.707m12.728 0l-.707.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.001 9.001 0 0012 21a9.001 9.001 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">面试报告</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">回顾历史面试表现，追踪能力提升轨迹</p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-2xl font-bold text-emerald-600">{interviews.length}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">已完成面试</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {interviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shadow-inner">
              <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">完成你的第一场面试，获取评估报告</h3>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-8 max-w-md mx-auto">AI 会为每场完成的面试生成多维度评估报告，帮你了解自己的优势和不足</p>
            <button
              onClick={() => navigate('/interviews')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              开始模拟面试
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {interviews.map(iv => {
              const overallScore = iv.feedback?.overall_score || Math.round((iv.score || 0) * 10)
              const dimensionScores = iv.feedback?.dimension_scores || {}
              return (
                <div key={iv.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* 左侧：总分 */}
                      <div className="flex items-center gap-4 sm:flex-col sm:text-center sm:gap-2 sm:w-28 shrink-0">
                        <div className={`text-4xl sm:text-5xl font-black ${getScoreColor(overallScore)}`}>
                          {overallScore}
                        </div>
                        <div className="sm:hidden text-sm text-gray-400 dark:text-gray-500">/ 100</div>
                        <div className={`hidden sm:block text-xs px-2 py-0.5 rounded-full font-medium ${getScoreBg(overallScore)}`}>
                          {overallScore >= 80 ? '表现优秀' : overallScore >= 60 ? '表现良好' : '需要改进'}
                        </div>
                      </div>

                      {/* 中间：信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">{iv.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreBg(overallScore)} sm:hidden`}>
                            {overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : '需改进'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 flex-wrap mb-3">
                          <span className={getDifficultyColor(iv.difficulty || 'MEDIUM')}>{getDifficultyLabel(iv.difficulty || 'MEDIUM')}</span>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span>{iv.position || '通用岗位'}</span>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span>{new Date(iv.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* 维度分数 */}
                        {Object.keys(dimensionScores).length > 0 && (
                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {Object.entries(dimensionScores).slice(0, 5).map(([key, value]: [string, unknown]) => {
                              const score = value as number;
                              return (
                                <div key={key} className="flex items-center gap-1.5">
                                  <span className="text-xs text-gray-400 dark:text-gray-500">{key}</span>
                                  <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                      style={{ width: `${score}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs font-bold ${getScoreColor(score)}`}>{score}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 右侧：操作按钮 */}
                      <div className="flex items-center shrink-0">
                        <button
                          onClick={() => navigate(`/interviews/${iv.id}/report`)}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-sm hover:shadow-md text-sm"
                        >
                          查看完整报告
                        </button>
                      </div>
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
