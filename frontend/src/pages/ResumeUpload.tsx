import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { useTheme } from '../context/ThemeContext'
import { resumeAPI } from '../services/api'

const TEMPLATE_NAMES: Record<string, string> = {
  minimal: '简约经典',
  modern: '现代时尚',
  business: '商务专业',
  creative: '创意个性',
  simple: '极简清新',
}

export default function ResumeUpload() {
  const { dark, toggleTheme } = useTheme()

  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const templateId = new URLSearchParams(location.search).get('template')
  const templateName = templateId ? TEMPLATE_NAMES[templateId] || templateId : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('请选择简历文件')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title || file.name)

      await resumeAPI.upload(token!, formData)

      navigate('/resumes')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '上传失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="返回"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">上传简历</span>
          </div>
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
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">上传简历</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">上传你的简历，AI 将为你智能分析优化</p>
        </div>

          {templateName && (
            <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 flex items-center gap-3">
              <span className="text-sm text-indigo-700 dark:text-indigo-300">你正在使用</span>
              <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-sm font-medium">{templateName}</span>
              <span className="text-sm text-indigo-700 dark:text-indigo-300">模板创建简历</span>
            </div>
          )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">简历标题</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例如：我的简历v1.0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">上传文件</label>
              <div className="relative">
                <input
                  type="file"
                  id="resume-file"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <label
                  htmlFor="resume-file"
                  className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:border-indigo-400 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors"
                >
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {file ? file.name : '点击选择 PDF / Word 文件'}
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">支持 .pdf、.doc、.docx 格式</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed dark:from-indigo-500 dark:to-indigo-600"
              >
                {loading ? '上传中...' : '创建简历'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
