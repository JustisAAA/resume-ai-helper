import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import ThemeToggle from '../components/ThemeToggle'
import { interviewAPI, resumeAPI } from '../services/api'
import { interviewSchema, type InterviewFormData } from '../schemas/interviewSchema'
import ErrorAlert from '../components/ErrorAlert'
import EmptyState from '../components/EmptyState'

interface Resume {
  id: string
  title: string
  status: string
}

export default function InterviewNew() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: { resumeId: '', position: '', difficulty: 'MEDIUM' },
  })

  const onSubmit = async (data: InterviewFormData) => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const res = await interviewAPI.create(token!, {
        resumeId: data.resumeId,
        title: `${data.position}模拟面试`,
        position: data.position,
        difficulty: data.difficulty
      })
      navigate(`/interviews/${res.id}/guide`)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '创建面试失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResumes() }, [])

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token')
      const data = await resumeAPI.list(token!) as unknown as Resume[];
      setResumes(data)
      if (data.length > 0) {
        // Set default resumeId if not set
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const msg = error.response?.data?.error || '获取简历列表失败';
      setError(msg);
    }
  }

  const difficultyOptions = [
    { value: 'EASY', label: '简单', desc: '基础问题，适合初学者', color: 'green' },
    { value: 'MEDIUM', label: '中等', desc: '标准难度，适合有经验者', color: 'yellow' },
    { value: 'HARD', label: '困难', desc: '高压面试，适合挑战者', color: 'red' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/practice')}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="返回首页"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <button
              onClick={() => navigate('/interviews')}
              className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回面试列表
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 dark:from-brand-700 dark:to-brand-900 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">开始新面试</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">基于简历内容，AI 为你生成个性化面试题</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 选择简历 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">选择简历 *</label>
              {resumes.length === 0 ? (
                <EmptyState title="还没有简历" description="请先上传简历才能进行模拟面试" />
              ) : (
                <select
                  {...register('resumeId')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent transition"
                >
                  <option value="">请选择简历...</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.title} {r.status === 'ANALYZED' ? '(已分析)' : ''}
                    </option>
                  ))}
                </select>
              )}
              {errors.resumeId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.resumeId.message}</p>
              )}
            </div>

            {/* 目标岗位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">目标岗位 *</label>
              <input
                type="text"
                {...register('position')}
                placeholder="例如：前端工程师、产品经理、数据分析师"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent transition"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.position.message}</p>
              )}
            </div>

            {/* 面试难度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">面试难度</label>
              <div className="grid grid-cols-3 gap-3">
                {difficultyOptions.map(opt => {
                  const isSelected = watch('difficulty') === opt.value
                  const colorMap: Record<string, { border: string; bg: string; ring: string; text: string }> = {
                    green: { border: 'border-green-400', bg: 'bg-green-50 dark:bg-green-900/30', ring: 'ring-green-200 dark:ring-green-800', text: 'text-green-700 dark:text-green-300' },
                    yellow: { border: 'border-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30', ring: 'ring-yellow-200 dark:ring-yellow-800', text: 'text-yellow-700 dark:text-yellow-300' },
                    red: { border: 'border-red-400', bg: 'bg-red-50 dark:bg-red-900/30', ring: 'ring-red-200 dark:ring-red-800', text: 'text-red-700 dark:text-red-300' },
                  }
                  const c = colorMap[opt.color]
                  return (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setValue('difficulty', opt.value as 'EASY' | 'MEDIUM' | 'HARD')
                        trigger('difficulty')
                      }}
                      className={`
                        cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-200
                        ${isSelected ? `${c.border} ${c.bg} ring-2 ${c.ring}` : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}
                      `}
                    >
                      <div className={`font-bold text-sm mb-1 ${isSelected ? c.text : 'text-gray-900 dark:text-white'}`}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{opt.desc}</div>
                    </div>
                  )
                })}
              </div>
              {errors.difficulty && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.difficulty.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || resumes.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-medium shadow-lg shadow-brand-500/25 dark:shadow-brand-400/25 hover:shadow-brand-500/40 dark:hover:shadow-brand-400/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '创建中...' : '开始面试'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
