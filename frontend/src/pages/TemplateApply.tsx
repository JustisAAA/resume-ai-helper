import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useTheme } from '../context/ThemeContext'
import { resumeAPI, Resume } from '../services/api'
import Loading from '../components/Loading'
import ErrorAlert from '../components/ErrorAlert'


const TEMPLATE_NAMES: Record<string, string> = {
  minimal: '简约经典',
  modern: '现代时尚',
  business: '商务专业',
  creative: '创意个性',
  simple: '极简清新',
}

function stripMarkdownCodeBlock(text: string): string {
  return text
    .replace(/^\s*```html\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
}

export default function TemplateApply() {
  const { dark, toggleTheme } = useTheme()

  const { id: templateId } = useParams<{ id: string }>()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [htmlResult, setHtmlResult] = useState<string>('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await resumeAPI.list(token!)
      setResumes(response)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '获取简历列表失败')
    } finally {
      setFetching(false)
    }
  }

  const handleApply = async () => {
    if (!selectedId) {
      setError('请选择一份简历')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await resumeAPI.applyTemplate(token!, selectedId, templateId!) as unknown as { html: string }

      setHtmlResult(stripMarkdownCodeBlock(response.html))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '应用模板失败')
    } finally {
      setLoading(false)
    }
  }

  if (htmlResult) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
          <button
            onClick={() => setHtmlResult('')}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ← 返回
          </button>
          <h2 className="font-semibold text-gray-900 dark:text-white">模板简历预览</h2>
          <a
            href={`data:text/html;charset=utf-8,${encodeURIComponent(htmlResult)}`}
            download={`简历_${TEMPLATE_NAMES[templateId!] || templateId}.html`}
            className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            下载HTML
          </a>
        </div>
        <iframe
          srcDoc={htmlResult}
          className="w-full h-[calc(100vh-53px)] border-0"
          title="简历预览"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/templates')} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="返回">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">应用模板：{TEMPLATE_NAMES[templateId!] || templateId}</span>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">选择简历</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">选择一份简历，应用「{TEMPLATE_NAMES[templateId!]}」模板生成格式化简历</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <ErrorAlert
            message={error}
            onRetry={error.includes('获取') ? () => { setError(''); setFetching(true); fetchResumes(); } : undefined}
            onClose={() => setError('')}
          />
        )}

        {fetching ? (
          <Loading text="正在加载简历列表..." />
        ) : resumes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">你还没有简历</p>
            <button
              onClick={() => navigate('/resumes/upload')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              去上传简历
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedId === r.id
                    ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/30'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{r.filename}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      状态：{r.status === 'ANALYZED' ? '已分析' : '草稿'}
                      · 更新于 {new Date(r.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedId === r.id && (
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-6">
              <button
                onClick={handleApply}
                disabled={loading || !selectedId}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:from-indigo-500 dark:to-purple-500"
              >
                {loading ? '生成中，请稍候...' : `应用「${TEMPLATE_NAMES[templateId!]}」模板`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
