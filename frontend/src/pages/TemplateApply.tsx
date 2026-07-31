import { useEffect, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useParams, useNavigate } from 'react-router-dom'

import { resumeAPI, Resume } from '../services/api'
import Loading from '../components/Loading'
import ErrorAlert from '../components/ErrorAlert'
import EmptyState from '../components/EmptyState'


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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
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
            className="ml-auto px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/templates')} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="返回">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">应用模板：{TEMPLATE_NAMES[templateId!] || templateId}</span>
          </div>
<ThemeToggle />

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
          <EmptyState title="还没有简历" description="请先创建简历" />
        ) : (
          <div className="space-y-3">
            {resumes.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedId === r.id
                    ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/30 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* 简历图标 */}
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    r.status === 'ANALYZED'
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  {/* 简历信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={r.fileName}>
                        {r.fileName || '未命名简历'}
                      </h3>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'ANALYZED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {r.status === 'ANALYZED' ? '已分析' : '草稿'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      {r.score !== undefined && r.score !== null && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-medium text-amber-600 dark:text-amber-400">{r.score}分</span>
                        </span>
                      )}
                      <span>更新于 {new Date(r.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* 选中图标 */}
                  {selectedId === r.id && (
                    <div className="shrink-0 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
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
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-600 text-white font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:from-brand-500 dark:to-brand-600"
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
