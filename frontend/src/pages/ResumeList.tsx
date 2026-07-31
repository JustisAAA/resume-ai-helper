import { useEffect, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom'

import { resumeAPI, Resume } from '../services/api'
import { useToast } from '../components/Toast'
import Loading from '../components/Loading'
import ErrorAlert from '../components/ErrorAlert'
import StatusBadge from '../components/StatusBadge'


export default function ResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => { fetchResumes() }, [])

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await resumeAPI.list(token!)
      setResumes(res)
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      setError(errObj.response?.data?.error || '获取简历列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这份简历吗？')) return
    try {
      const token = localStorage.getItem('token')
      await resumeAPI.delete(token!, id)
      fetchResumes()
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      showToast(errObj.response?.data?.error || '删除失败', 'error')
    }
  }

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/practice')}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="返回"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">简历面试AI助手</span>
          </div>
          {/* 主题切换 */}
<ThemeToggle />

        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">我的简历</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">管理所有简历，AI 智能分析助力优化</p>
          </div>
          <button
            onClick={() => navigate('/resumes/upload')}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-600 text-white rounded-xl font-medium shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            + 上传简历
          </button>
        </div>

        {error && <ErrorAlert message={error} />}

        {resumes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-brand-100 to-brand-100 dark:from-brand-900/50 dark:to-brand-900/50 flex items-center justify-center shadow-inner">
              <svg className="w-12 h-12 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3 3 0 00-3-3H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">上传你的第一份简历吧</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">AI 将智能分析简历内容，给出优化建议和评分，帮你提升求职竞争力</p>
            <button
              onClick={() => navigate('/resumes/upload')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-600 text-white rounded-xl font-medium hover:from-brand-700 hover:to-brand-700 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              上传简历
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {resumes.map(resume => {
              return (
                <div key={resume.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-600 transition-all duration-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{resume.title}</h3>
                        <StatusBadge status={resume.status} type="resume" />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>评分: <strong className={resume.score ? 'text-brand-600 dark:text-brand-400' : ''}>{resume.score ?? '-'}</strong></span>
                        <span>更新: {new Date(resume.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/resumes/${resume.id}`)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        删除
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
