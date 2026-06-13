import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { interviewAPI } from '../services/api'
import Loading from '../components/Loading'
import ErrorAlert from '../components/ErrorAlert'

interface Interview {
  id: string
  title: string
  position?: string
  difficulty: string
  status: string
}

export default function InterviewGuide() {
  const { id } = useParams<{ id: string }>()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchInterview()
  }, [id])

  const fetchInterview = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await interviewAPI.getDetail(token!, id!) as unknown as Interview
      setInterview(res)
      if (res.status === 'IN_PROGRESS' || res.status === 'COMPLETED') {
        navigate(`/interviews/${id}/room`)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || '获取面试详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStartInterview = () => {
    navigate(`/interviews/${id}/room`)
  }

  const handleBack = () => {
    navigate('/interviews')
  }

  const difficultyLabel = interview?.difficulty === 'EASY' ? '简单' : 
                          interview?.difficulty === 'HARD' ? '困难' : '中等'

  if (loading) return <Loading fullScreen size="md" text="加载中..." />;

  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="返回面试列表"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">面试准备</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 面试信息卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{interview?.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {interview?.position || '通用岗位'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  interview?.difficulty === 'EASY' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  interview?.difficulty === 'HARD' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {difficultyLabel}
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            面试即将开始，请仔细阅读以下指南，做好准备。
          </p>
        </div>

        {/* 面试流程说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">📋</span>
            面试流程
          </h2>
          <div className="space-y-4">
            {[
              { step: 1, title: 'AI 面试官提问', desc: '系统会根据你的简历和岗位自动生成面试问题，逐题进行。' },
              { step: 2, title: '你回答问题', desc: '在输入框中输入你的回答，可以按 Shift+Enter 换行，按 Enter 发送。' },
              { step: 3, title: 'AI 评估反馈', desc: '每题回答后，AI 会给出评分和详细反馈，帮助你了解表现。' },
              { step: 4, title: '查看面试报告', desc: '面试结束后，系统生成详细报告，包括得分、能力分析和改进建议。' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 注意事项 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">⚠️</span>
            注意事项
          </h2>
          <div className="space-y-3">
            {[
              '请确保网络连接稳定，避免面试过程中断线。',
              '建议在安静的环境中进行面试，避免干扰。',
              '可以开启语音模式，使用语音输入和播放题目（需允许麦克风权限）。',
              '回答时尽量详细，使用 STAR 法则（情境-任务-行动-结果）组织答案。',
              '如果遇到技术问题，可以退出后重新进入，已回答的题目会保留。',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 示例问题 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 dark:text-green-400 flex items-center justify-center text-sm">💡</span>
            示例问题
          </h2>
          <div className="space-y-3">
            {[
              '请介绍一下你自己和你的项目经验。',
              '你为什么选择这个岗位？你认为自己有哪些优势？',
              '描述一个你解决过的技术难题，你是如何处理的？',
              '在团队项目中，你是如何与同事协作的？遇到过分歧吗？',
              '你对未来3-5年的职业规划是什么？',
            ].map((question, i) => (
              <div key={i} className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{question}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 开始面试按钮 */}
        <div className="text-center pt-4">
          <button
            onClick={handleStartInterview}
            className="px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-600 text-white rounded-xl font-semibold text-lg hover:from-brand-700 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 duration-200 inline-flex items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            开始面试
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            点击上方按钮开始面试，系统将自动进入面试房间
          </p>
        </div>
      </div>
    </div>
  )
}
