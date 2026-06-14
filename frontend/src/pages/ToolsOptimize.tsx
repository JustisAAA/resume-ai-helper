import { useState, useRef } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { exportResumeDataToPdf } from '../utils/exportPdf'

import { toolsAPI } from '../services/api'
import { ButtonSpinner } from '../components/Loading'

interface MatchAnalysis {
  score: number;
  missing_keywords?: string[];
  direction?: string;
}

interface OptimizeRequest {
  targetRole: string;
  mode: string;
  scene: string;
  resume?: string;
}

interface OptimizeResult {
  highlights?: string[];
  skills_tags?: string[];
  match_analysis?: MatchAnalysis | null;
  optimized_resume?: string;
  changes_summary?: Array<{ original: string; optimized: string; reason: string }>;
  tips?: string[];
}

interface BeforeAfterMatchResult {
  overall_score?: number;
  semantic_score?: number;
}

export default function ToolsOptimize() {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('text')
  const [file, setFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [parsedResumeText, setParsedResumeText] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState<'before' | 'optimize' | 'after' | ''>('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'full' | 'compress' | 'expand'>('full')
  const [scene, setScene] = useState<'general' | 'intern' | 'tech' | 'clerical'>('general')
  const [result, setResult] = useState<OptimizeResult | null>(null)
  const [beforeMatch, setBeforeMatch] = useState<BeforeAfterMatchResult | null>(null)
  const [afterMatch, setAfterMatch] = useState<BeforeAfterMatchResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const EXAMPLE_RESUME = `张明
手机号码：13800138000 | 邮箱：zhangming@email.com
教育背景
2019.09 - 2023.06  某某大学  计算机科学与技术  本科
工作经历
2023.07 - 至今  某科技有限公司  前端开发工程师
· 负责公司主要产品的前端开发工作
· 参与项目需求分析和技术方案设计
· 使用 React 进行页面开发
· 与后端同事协作完成接口对接
项目经验
2023.10 - 2024.03  电商平台前端重构
· 使用 React + TypeScript 重构老旧 jQuery 代码
· 将页面加载速度提升了 30%
· 负责购物车和支付模块的开发
技能特长
· 熟练使用 React、Vue 等前端框架
· 掌握 JavaScript、TypeScript、HTML、CSS
· 了解 Node.js、Webpack 等工具`

  const handleFillExample = () => {
    setResumeText(EXAMPLE_RESUME)
    setTargetRole('前端开发工程师')
    showToast('已填入示例简历和目标岗位', 'success')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB')
      return
    }
    setFile(f)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await toolsAPI.parseFile(token!, f)
      setParsedResumeText(res.text || '')
    } catch {
      setError('文件解析失败，请切换"粘贴"模式手动输入')
      setParsedResumeText('')
    }
  }

  const handleSubmit = async () => {
    const resumeTextToUse = activeTab === 'text' ? resumeText.trim() : parsedResumeText.trim();
    if (!resumeTextToUse) {
      setError(activeTab === 'upload' ? '文件解析失败，请切换"粘贴"模式' : '请输入简历内容');
      return;
    }
    setLoading(true);
    setError('');
    setBeforeMatch(null);
    setAfterMatch(null);
    try {
      const token = localStorage.getItem('token');
      // 第一步：优化前匹配度
      setLoadingStep('before');
      try {
        const beforeRes = await toolsAPI.match(token!, { resume: resumeTextToUse, jd: targetRole || '通用岗位' }) as BeforeAfterMatchResult;
        setBeforeMatch(beforeRes);
      } catch (e) {
        console.error('优化前匹配度计算失败:', e);
      }
      // 第二步：优化简历
      setLoadingStep('optimize');
      const reqBody: OptimizeRequest = { targetRole, mode, scene, resume: resumeTextToUse };
      const res = await toolsAPI.optimize(token!, reqBody) as OptimizeResult;
      setResult(res);
      // 第三步：优化后匹配度
      setLoadingStep('after');
      try {
        const afterResume = res.optimized_resume || resumeTextToUse;
        const afterRes = await toolsAPI.match(token!, { resume: afterResume, jd: targetRole || '通用岗位' }) as BeforeAfterMatchResult;
        setAfterMatch(afterRes);
      } catch (e) {
        console.error('优化后匹配度计算失败:', e);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '优化失败，请重试');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('已复制到剪贴板', 'success')
    } catch {
      showToast('复制失败', 'error')
    }
  }

  const handleReset = () => {
    setResult(null)
    setResumeText('')
    setFile(null)
    setTargetRole('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/practice')}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">简历优化</span>
          </div>
<ThemeToggle />

        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero 区 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">简历优化</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">AI 使用 STAR 法则智能优化你的简历，提升竞争力</p>
        </div>

        {/* 有结果时：显示结果 */}
        {result ? (
          <div className="space-y-6">
            {/* 结果操作栏 */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">优化结果</h2>
              <button
                onClick={handleReset}
                className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:bg-brand-900/20 transition-colors font-medium"
              >
                ← 重新优化
              </button>
            </div>

            {/* 核心亮点 */}
            {result.highlights && result.highlights.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-amber-200/50 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-white">⭐ 核心亮点</h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {result.highlights.map((h: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm font-medium border border-amber-200/50">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 能力标签 */}
            {result.skills_tags && result.skills_tags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-brand-200/50 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-white">🏷 能力标签</h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {result.skills_tags.map((t: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 岗位匹配分析 */}
            {result.match_analysis && result.match_analysis !== null && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-rose-50 to-rose-100/50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-rose-200/50 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-white">📊 岗位匹配分析</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-end gap-3">
                    <div className="text-4xl font-black text-rose-600">{result.match_analysis.score}</div>
                    <div className="text-sm text-gray-400 dark:text-gray-500 mb-1">/ 100 分</div>
                  </div>
                  {result.match_analysis.missing_keywords && result.match_analysis.missing_keywords.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">缺失关键词</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.match_analysis.missing_keywords.map((kw: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.match_analysis.direction && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.match_analysis.direction}</p>
                  )}
                </div>
              </div>
            )}

            {/* 优化前后对比 */}
            {(beforeMatch || afterMatch) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-brand-200/50 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-white">📊 优化前后对比</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* 优化前 */}
                    <div className="text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">优化前</div>
                      <div className="text-3xl font-black text-gray-400 dark:text-gray-500">{beforeMatch?.overall_score ?? '-'}</div>
                      {beforeMatch?.semantic_score !== undefined && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">语义 {beforeMatch.semantic_score}</div>
                      )}
                    </div>
                    {/* 箭头 */}
                    <div className="flex items-center justify-center">
                      <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </div>
                    {/* 优化后 */}
                    <div className="text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">优化后</div>
                      <div className="text-3xl font-black text-brand-600 dark:text-brand-400">{afterMatch?.overall_score ?? '-'}</div>
                      {afterMatch?.semantic_score !== undefined && (
                        <div className="text-xs text-brand-600 dark:text-brand-400">语义 {afterMatch.semantic_score}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 优化后简历 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-amber-200/50 dark:border-gray-600 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 dark:text-white">✨ 优化后的简历</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await exportResumeDataToPdf({
                            title: '优化后的简历',
                            content: result.optimized_resume || '',
                          }, '优化后的简历')
                          showToast('PDF导出成功', 'success')
                        } catch (err: unknown) {
                          const error = err as Error;
                          showToast('PDF导出失败：' + error.message, 'error')
                        }
                      }}
                      className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 px-3 py-1 rounded-lg hover:bg-white dark:bg-gray-800/70 transition-colors font-medium"
                    >
                      📄 导出PDF
                    </button>
                    <button
                      onClick={() => handleCopy(result.optimized_resume || '')}
                      className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 px-3 py-1 rounded-lg hover:bg-white dark:bg-gray-800/70 transition-colors font-medium"
                    >
                      复制全文
                    </button>
                  </div>
                </div>
              <div className="p-6">
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-sm leading-relaxed max-h-96 overflow-y-auto">
                  {result.optimized_resume}
                </div>
              </div>
            </div>

            {/* 改动对比 */}
            {result.changes_summary && result.changes_summary.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-brand-200/50 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-white">🔄 关键改动对比</h3>
                </div>
                <div className="p-6 space-y-4">
                  {result.changes_summary.map((change, idx: number) => (
                    <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                      <div>
                        <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">原文</span>
                        <p className="text-sm text-gray-600 dark:text-gray-500 mt-2">{change.original}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">优化后</span>
                        <p className="text-sm text-gray-900 dark:text-white mt-2 font-medium">{change.optimized}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded">原因</span>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{change.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 建议 */}
            {result.tips && result.tips.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-brand-200/50 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-white">💡 额外建议</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    {result.tips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-brand-500 mt-0.5 shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 无结果：输入表单 */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Tab 切换 */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => { setActiveTab('text'); setError('') }}
                className={`flex-1 py-3.5 text-sm font-medium text-center transition-colors ${
                  activeTab === 'text'
                    ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 bg-amber-50/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                粘贴文本
              </button>
              <button
                onClick={() => { setActiveTab('upload'); setError('') }}
                className={`flex-1 py-3.5 text-sm font-medium text-center transition-colors ${
                  activeTab === 'upload'
                    ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 bg-amber-50/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                上传文件
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 text-sm">{error}</div>
              )}

              {/* 上传文件模式 */}
              {activeTab === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-amber-400 hover:bg-amber-50/30 cursor-pointer transition-colors"
                  >
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {file ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">{file.name}</span>
                      ) : (
                        '点击选择 PDF / Word / TXT 文件'
                      )}
                    </span>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 .pdf、.doc、.docx、.txt 格式，最大 10MB</p>
                  </div>
                  {file && (
                    <button
                      onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      移除文件
                    </button>
                  )}
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-amber-700 text-xs">
                    💡 提示：上传文件后将自动解析内容，也可切换到"粘贴文本"模式直接粘贴简历内容，或使用"填入示例"快速体验。
                  </div>
                </div>
              )}

              {/* 粘贴文本模式 */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">简历内容 <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleFillExample}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 px-2 py-1 rounded-md hover:bg-amber-50 dark:bg-amber-900/20 transition-colors font-medium"
                      >
                        ✨ 填入示例
                      </button>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{resumeText.length} 字</span>
                    </div>
                  </div>
                  <textarea
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none resize-none text-sm"
                    placeholder="粘贴你的简历全文内容..."
                  />
                </div>
              )}

              {/* 目标岗位 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">目标岗位（可选）</label>
                <input
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  placeholder="例如：前端工程师、产品经理"
                />
              </div>

              {/* 优化模式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">优化模式</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'full', label: '全面优化', desc: '全面重写，STAR法则' },
                    { value: 'compress', label: '精简压缩', desc: '删除冗余，保留核心' },
                    { value: 'expand', label: '补充指引', desc: '指出薄弱，给出方向' },
                  ].map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => setMode(opt.value as 'full' | 'compress' | 'expand')}
                      className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                        mode === opt.value
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-200 dark:ring-amber-700'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-sm font-bold ${mode === opt.value ? 'text-amber-700 dark:text-amber-400' : 'text-gray-900 dark:text-gray-100'}`}>{opt.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 场景风格 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">简历场景</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'general', label: '通用' },
                    { value: 'intern', label: '实习' },
                    { value: 'tech', label: '技术岗' },
                    { value: 'clerical', label: '文职岗' },
                  ].map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => setScene(opt.value as 'general' | 'intern' | 'tech' | 'clerical')}
                      className={`cursor-pointer rounded-lg border-2 px-3 py-2 text-center text-sm font-medium transition-all duration-200 ${
                        scene === opt.value
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 ring-2 ring-amber-200'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                onClick={handleSubmit}
                disabled={loading || (activeTab === 'text' ? !resumeText.trim() : !file)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <ButtonSpinner />
                    {loadingStep === 'before' && '优化前匹配度计算中...'}
                    {loadingStep === 'optimize' && 'AI 优化中...'}
                    {loadingStep === 'after' && '优化后匹配度计算中...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                    AI 优化简历
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
