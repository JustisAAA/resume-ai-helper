import { useState, useRef } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { exportTextToPdf } from '../utils/exportPdf'

import { toolsAPI } from '../services/api'
import { ButtonSpinner } from '../components/Loading'
import ErrorAlert from '../components/ErrorAlert'
import EmptyState from '../components/EmptyState'

interface Question {
  id: number;
  question: string;
  difficulty: string;
  category: string;
  purpose?: string;
  semantic_difficulty_score?: number;
  intent_analysis?: string;
}

interface QuestionsResult {
  questions: Question[];
  overall_assessment?: string;
}

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

const EXAMPLE_JD = `岗位名称：高级前端开发工程师
公司：某互联网科技公司
薪资范围：25-40K·14薪
任职要求：
1. 本科及以上学历，计算机相关专业，3年以上前端开发经验
2. 精通 React/Vue 等主流前端框架
3. 熟悉 TypeScript，有大型项目开发经验
4. 掌握 Webpack/Vite 等构建工具`

export default function ToolsQuestions() {
  const [resumeActiveTab, setResumeActiveTab] = useState<'upload' | 'text'>('text')
  const [jdActiveTab, setJdActiveTab] = useState<'upload' | 'text'>('text')
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText] = useState('')
  const [parsedResumeText, setParsedResumeText] = useState('')
  const [parsedJdText, setParsedJdText] = useState('')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<QuestionsResult | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jdFile, setJdFile] = useState<File | null>(null)
  const resumeFileInputRef = useRef<HTMLInputElement>(null)
  const jdFileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const getDifficultyBadge = (difficulty: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      easy: { bg: 'bg-green-100', text: 'text-green-700' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      hard: { bg: 'bg-red-100', text: 'text-red-700' },
    }
    const style = map[difficulty] || map.medium
    const label = difficulty === 'easy' ? '简单' : difficulty === 'hard' ? '困难' : '中等'
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>{label}</span>
    )
  }
  const getCategoryBadge = (category: string) => {
    const map: Record<string, string> = { technical: '技术', behavioral: '行为', situational: '情境' }
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-50 text-cyan-700">{map[category] || category}</span>
    )
  }

  const handleFillExample = (type: 'resume' | 'jd') => {
    if (type === 'resume') setResumeText(EXAMPLE_RESUME)
    else setJdText(EXAMPLE_JD)
  }

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setError('文件大小不能超过 10MB'); return }
    setResumeFile(f)
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
  const handleJdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setError('文件大小不能超过 10MB'); return }
    setJdFile(f)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await toolsAPI.parseFile(token!, f)
      setParsedJdText(res.text || '')
    } catch {
      setError('文件解析失败，请切换"粘贴"模式手动输入')
      setParsedJdText('')
    }
  }

  const handleSubmit = async () => {
    const resumeTextToUse = resumeActiveTab === 'text' ? resumeText.trim() : parsedResumeText.trim();
    const jdTextToUse = jdActiveTab === 'text' ? jdText.trim() : parsedJdText.trim();
    if (!resumeTextToUse) { setError('请输入简历内容'); return }
    setLoading(true); setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await toolsAPI.questions(token!, { resume: resumeTextToUse, jd: jdTextToUse, count }) as QuestionsResult
      setResult(res)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '生成失败，请重试')
    } finally { setLoading(false) }
  }

  const handleReset = () => { setResult(null); setResumeText(''); setJdText(''); setError('') }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/practice')} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">面试题生成</span>
          </div>
<ThemeToggle />

        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero 区 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">面试题生成</h1>
          <p className="text-gray-500 dark:text-gray-500 mt-1">AI 根据简历和 JD 生成针对性面试问题</p>
        </div>

        {/* 有结果：显示结果 */}
        {result ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">生成结果</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      const content = (result.questions || []).map((q: Question, idx: number) => 
                        `Q${idx + 1}: ${q.question}\n考察目的：${q.purpose || ''}`
                      ).join('\n\n')
                      await exportTextToPdf('面试题列表', `整体评估：\n${result.overall_assessment || ''}\n\n${content}`, '面试题生成结果')
                      showToast('PDF导出成功', 'success')
                      } catch (err: unknown) {
                        const error = err as Error;
                        showToast('PDF导出失败：' + error.message, 'error')
                    }
                  }}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:bg-brand-900/20 transition-colors font-medium"
                >
                  📄 导出PDF
                </button>
                <button onClick={handleReset} className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:bg-brand-900/20 transition-colors font-medium">
                  ← 重新生成
                </button>
              </div>
            </div>

            {/* 整体评估 */}
            {result.overall_assessment && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-50 to-cyan-100/50 px-6 py-4 border-b border-cyan-200/50">
                  <h3 className="font-bold text-gray-900 dark:text-white">整体评估</h3>
                </div>
                <div className="p-6">
                  {result.overall_assessment.includes('{"questions"') || result.overall_assessment.trim().startsWith('{') ? (
                    // AI 偶尔会把整体评估输出成 JSON 字面量，显示提示而不是原始字符串
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ 评估信息格式异常，请参考下方问题列表
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{result.overall_assessment}</p>
                  )}
                </div>
              </div>
            )}

            {/* 问题列表 */}
            <div className="space-y-4">
              {(result.questions || []).map((q: Question, idx: number) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:border-cyan-200 hover:shadow-md transition-all duration-200">
                  <div className="bg-gradient-to-r from-cyan-50/50 to-cyan-100/30 px-6 py-3 border-b border-cyan-100/50 flex items-center justify-between">
                    <span className="text-sm font-bold text-cyan-700">Q{idx + 1}</span>
                    <div className="flex gap-2">
                      {getDifficultyBadge(q.difficulty)}
                      {getCategoryBadge(q.category)}
                      {q.semantic_difficulty_score !== undefined && (
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          q.semantic_difficulty_score >= 70 ? 'bg-orange-200 text-orange-800' :
                          q.semantic_difficulty_score >= 40 ? 'bg-amber-200 text-amber-800' :
                          'bg-brand-200 text-brand-800'
                        }`}>
                          语义{q.semantic_difficulty_score}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-3">{q.question}</p>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-medium">考察目的：</span>{q.purpose}</p>
                      {q.intent_analysis && (
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-2 rounded-lg">
                          <span className="font-medium">出题意图：</span>{q.intent_analysis}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(result.questions || []).length === 0 && (
              <EmptyState size="sm" title="暂无生成的问题" description="请调整输入后重试" />
            )}
          </div>
        ) : (
          /* 无结果：输入表单 */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* 简历输入区 */}
            <div className="border-b border-gray-100 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">简历内容 <span className="text-red-500">*</span></h3>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleFillExample('resume')} className="text-xs text-cyan-600 hover:text-cyan-800 px-2 py-1 rounded-md hover:bg-cyan-50 transition-colors font-medium">✨ 填入示例</button>
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button onClick={() => { setResumeActiveTab('text'); setError('') }} className={`px-3 py-1 text-xs font-medium transition-colors ${resumeActiveTab === 'text' ? 'bg-cyan-50 text-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-500 hover:bg-gray-50'}`}>粘贴</button>
                    <button onClick={() => { setResumeActiveTab('upload'); setError('') }} className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${resumeActiveTab === 'upload' ? 'bg-cyan-50 text-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-500 hover:bg-gray-50'}`}>上传</button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {resumeActiveTab === 'upload' ? (
                  <div>
                    <input ref={resumeFileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleResumeFileChange} className="hidden" />
                    <div onClick={() => resumeFileInputRef.current?.click()} className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-cyan-400 hover:bg-cyan-50/30 cursor-pointer transition-colors">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {resumeFile ? (
                        <span className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">{resumeFile.name}</span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-500">点击选择文件</span>
                      )}
                    </div>
                    {resumeFile && (
                      <button
                        onClick={() => { setResumeFile(null); setParsedResumeText(''); if (resumeFileInputRef.current) resumeFileInputRef.current.value = '' }}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        移除文件
                      </button>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">上传文件后将自动解析内容</p>
                  </div>
                ) : (
                  <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={8} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none text-sm" placeholder="粘贴你的简历内容..." />
                )}
              </div>
            </div>

            {/* JD 输入区 */}
            <div className="border-b border-gray-100 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">职位描述（可选）</h3>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleFillExample('jd')} className="text-xs text-cyan-600 hover:text-cyan-800 px-2 py-1 rounded-md hover:bg-cyan-50 transition-colors font-medium">✨ 填入示例</button>
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button onClick={() => { setJdActiveTab('text'); setError('') }} className={`px-3 py-1 text-xs font-medium transition-colors ${jdActiveTab === 'text' ? 'bg-cyan-50 text-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-500 hover:bg-gray-50'}`}>粘贴</button>
                    <button onClick={() => { setJdActiveTab('upload'); setError('') }} className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${jdActiveTab === 'upload' ? 'bg-cyan-50 text-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-500 hover:bg-gray-50'}`}>上传</button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {jdActiveTab === 'upload' ? (
                  <div>
                    <input ref={jdFileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleJdFileChange} className="hidden" />
                    <div onClick={() => jdFileInputRef.current?.click()} className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-cyan-400 hover:bg-cyan-50/30 cursor-pointer transition-colors">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {jdFile ? (
                        <span className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">{jdFile.name}</span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-500">点击选择文件</span>
                      )}
                    </div>
                    {jdFile && (
                      <button
                        onClick={() => { setJdFile(null); setParsedJdText(''); if (jdFileInputRef.current) jdFileInputRef.current.value = '' }}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        移除文件
                      </button>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">上传文件后将自动解析内容</p>
                  </div>
                ) : (
                  <textarea value={jdText} onChange={e => setJdText(e.target.value)} rows={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none text-sm" placeholder="粘贴职位描述（JD）内容，可选..." />
                )}
              </div>
            </div>

            {/* 生成数量 */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">生成问题数量</label>
              <div className="flex items-center gap-4">
                <input value={count} onChange={e => setCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))} type="range" min={1} max={10} className="flex-1" />
                <span className="text-lg font-bold text-cyan-600 w-8 text-center">{count}</span>
              </div>
            </div>

            {/* 提交 */}
            <div className="p-6 space-y-3">
              {error && <ErrorAlert message={error} />}
              <button onClick={handleSubmit} disabled={loading || (resumeActiveTab === 'text' ? !resumeText.trim() : false)} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (<> <ButtonSpinner /> AI 生成中... </>) : (<> <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> 生成面试题 </>)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
