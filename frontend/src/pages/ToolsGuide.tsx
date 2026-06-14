import { useState, useRef } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { exportTextToPdf } from '../utils/exportPdf'

import { toolsAPI } from '../services/api'
import { ButtonSpinner } from '../components/Loading'
import EmptyState from '../components/EmptyState'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface GuideResult {
  guide?: string;
  overall_guide?: string;
  steps?: Array<{ step: number; title: string; content: string }>;
  tips?: string[];
}

interface TrendResult {
  trends?: Array<{ skill: string; '2024': number; '2025': number; '2026': number }>;
  advice?: string;
  note?: string;
}

export default function ToolsGuide() {
  // 标签页状态
  const [activeTab, setActiveTab] = useState<'guide' | 'trend'>('guide')

  // 求职攻略（guide标签页）状态
  const [resumeActiveTab, setResumeActiveTab] = useState<'upload' | 'text'>('text')
  const [resumeText, setResumeText] = useState('')
  const [parsedResumeText, setParsedResumeText] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [question, setQuestion] = useState('')
  const [guideLoading, setGuideLoading] = useState(false)
  const [guideError, setGuideError] = useState('')
  const [guideResult, setGuideResult] = useState<GuideResult | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const resumeFileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  // 趋势预测（trend标签页）状态
  const [trendRole, setTrendRole] = useState('')
  const [trendLoading, setTrendLoading] = useState(false)
  const [trendError, setTrendError] = useState('')
  const [trendResult, setTrendResult] = useState<TrendResult | null>(null)

  // ========== 求职攻略相关函数 ==========
  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setGuideError('文件大小不能超过 10MB'); return }
    setResumeFile(f)
    setGuideError('')
    try {
      const token = localStorage.getItem('token')
      const res = await toolsAPI.parseFile(token!, f)
      setParsedResumeText(res.text || '')
    } catch {
      setGuideError('文件解析失败，请切换"粘贴"模式手动输入')
      setParsedResumeText('')
    }
  }

  const handleGuideSubmit = async () => {
    const resumeTextToUse = resumeActiveTab === 'text' ? resumeText.trim() : parsedResumeText.trim();
    if (!question.trim()) { setGuideError('请输入你的问题'); return }
    if (resumeActiveTab === 'upload' && !resumeTextToUse) { setGuideError('文件解析失败，请切换"粘贴"模式'); return }
    setGuideLoading(true); setGuideError('')
    try {
      const token = localStorage.getItem('token')
      const res = await toolsAPI.guide(token!, { resume: resumeTextToUse, targetRole, question }) as GuideResult
      setGuideResult(res)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setGuideError(error.response?.data?.error || '生成失败，请重试')
    } finally { setGuideLoading(false) }
  }

  const handleGuideReset = () => { setGuideResult(null); setResumeText(''); setTargetRole(''); setQuestion(''); setGuideError('') }

  // ========== 趋势预测相关函数 ==========
  const handleTrendSubmit = async () => {
    if (!trendRole.trim()) { setTrendError('请输入目标岗位'); return }
    setTrendLoading(true); setTrendError('')
    try {
      const token = localStorage.getItem('token')
      const res = await toolsAPI.trend(token!, { targetRole: trendRole.trim() }) as TrendResult
      setTrendResult(res)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setTrendError(error.response?.data?.error || '预测失败，请重试')
    } finally { setTrendLoading(false) }
  }

  const handleTrendReset = () => { setTrendResult(null); setTrendRole(''); setTrendError('') }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/practice')} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="返回">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">求职攻略</span>
          </div>
<ThemeToggle />

        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero 区 */}
        <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">求职攻略</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">AI 为你提供求职全阶段的实用建议和工具</p>
        </div>

        {/* 标签页切换 */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => { setActiveTab('guide'); setGuideError(''); setTrendError('') }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'guide' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            📋 求职攻略
          </button>
          <button
            onClick={() => { setActiveTab('trend'); setGuideError(''); setTrendError('') }}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${activeTab === 'trend' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            📈 趋势预测
          </button>
        </div>

        {/* ========== 求职攻略标签页 ========== */}
        {activeTab === 'guide' && (
          <>
            {/* 有结果：显示结果 */}
            {guideResult ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">攻略结果</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await exportTextToPdf('求职攻略', guideResult.guide || '', '求职攻略')
                          showToast('PDF导出成功', 'success')
                        } catch (err: unknown) {
                          const error = err as Error;
                          showToast('PDF导出失败：' + error.message, 'error')
                        }
                      }}
                      className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors font-medium"
                    >
                      📄 导出PDF
                    </button>
                    <button onClick={handleGuideReset} className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors font-medium">
                      ← 重新提问
                    </button>
                  </div>
                </div>

                {/* 攻略内容 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white">求职攻略详情</h3>
                  </div>
                  <div className="p-6">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600 leading-relaxed whitespace-pre-wrap font-sans">{guideResult.guide || <EmptyState size="sm" title="暂无内容" />}</pre>
                  </div>
                </div>
              </div>
            ) : (
              /* 无结果：输入表单 */
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* 简历输入区 */}
                <div className="border-b border-gray-100 dark:border-gray-800">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">简历内容（可选）</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button onClick={() => { setResumeActiveTab('text'); setGuideError('') }} className={`px-3 py-1 text-xs font-medium transition-colors ${resumeActiveTab === 'text' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>粘贴</button>
                        <button onClick={() => { setResumeActiveTab('upload'); setGuideError('') }} className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${resumeActiveTab === 'upload' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-500 hover:bg-gray-50'}`}>上传</button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {resumeActiveTab === 'upload' ? (
                      <div>
                        <input ref={resumeFileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleResumeFileChange} className="hidden" />
                        <div onClick={() => resumeFileInputRef.current?.click()} className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-amber-400 hover:bg-amber-50/30 cursor-pointer transition-colors">
                          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          {resumeFile ? (
                            <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">{resumeFile.name}</span>
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
                      <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none text-sm" placeholder="粘贴你的简历内容（可选）..." />
                    )}
                  </div>
                </div>

                {/* 目标岗位输入区 */}
                <div className="border-b border-gray-100 dark:border-gray-800">
                  <div className="px-6 py-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">目标岗位（可选）</h3>
                  </div>
                  <div className="px-6 pb-6">
                    <input value={targetRole} onChange={e => setTargetRole(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm" placeholder="例如：前端开发工程师、产品经理..." />
                  </div>
                </div>

                {/* 问题输入区 */}
                <div className="border-b border-gray-100 dark:border-gray-800">
                  <div className="px-6 py-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">你的问题 <span className="text-red-500">*</span></h3>
                  </div>
                  <div className="px-6 pb-6">
                    <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none text-sm" placeholder="请输入你的问题，例如：面试前应该如何准备？薪资谈判有什么技巧？" />
                  </div>
                </div>

                {/* 提交 */}
                <div className="p-6 space-y-3">
                  {guideError && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 text-sm">{guideError}</div>}
                  <button onClick={handleGuideSubmit} disabled={guideLoading || !question.trim()} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-500 text-white font-medium shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {guideLoading ? (<> <ButtonSpinner /> AI 生成中... </>) : (<> <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> 获取求职攻略 </>)}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========== 趋势预测标签页 ========== */}
        {activeTab === 'trend' && (
          <>
            {trendResult ? (
              /* 有结果：显示趋势图表和建议 */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">趋势预测结果</h2>
                  <button onClick={handleTrendReset} className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors font-medium">
                    ← 重新预测
                  </button>
                </div>

                {/* 模拟数据提示 */}
                {trendResult.note && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-amber-700 text-sm">
                    ⚠️ {trendResult.note}
                  </div>
                )}

                {/* 技能需求趋势图表 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white">技能需求趋势（2024-2026）</h3>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={420}>
                      <LineChart data={prepareChartData(trendResult.trends || [])} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" tick={{ fontSize: 13 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 13 }} width={40} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                          itemStyle={{ fontSize: '12px' }}
                          formatter={(value: any, name: any) => {
                            const shortName = getShortSkillName(name as string);
                            return [`${value}分`, shortName];
                          }}
                        />
                        <Legend
                          layout="horizontal"
                          align="center"
                          verticalAlign="bottom"
                          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                          formatter={(value: string) => getShortSkillName(value)}
                        />
                        {(trendResult.trends || []).map((t, i) => (
                          <Line key={t.skill} type="monotone" dataKey={t.skill} stroke={['#0d9488', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'][i % 8]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 职业规划建议 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white">职业规划建议</h3>
                  </div>
                  <div className="p-6">
                    {trendResult.advice ? renderAdvice(trendResult.advice) : <EmptyState size="sm" title="暂无建议" />}
                  </div>
                </div>
              </div>
            ) : (
              /* 无结果：输入表单 */
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">目标岗位 <span className="text-red-500">*</span></h3>
                    <input
                      value={trendRole}
                      onChange={e => setTrendRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                      placeholder="例如：前端开发工程师、后端开发工程师、AI算法工程师..."
                    />
                  </div>

                  {trendError && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 text-sm">{trendError}</div>}

                  <button
                    onClick={handleTrendSubmit}
                    disabled={trendLoading || !trendRole.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-500 text-white font-medium shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {trendLoading ? (<> <ButtonSpinner /> 预测中... </>) : (<> 📈 预测趋势 </>)}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ========== 辅助函数：解析markdown文本为JSX ==========
function renderAdvice(text: string) {
  // 解析行内的 **加粗** 标记
  const parseInline = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  return text.split('\n').map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      return <h3 key={idx} className="text-lg font-bold mt-5 mb-3 text-gray-900 dark:text-white">{trimmed.replace('## ', '')}</h3>;
    }
    if (trimmed.startsWith('### ')) {
      return <h4 key={idx} className="text-base font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">{trimmed.replace('### ', '')}</h4>;
    }
    if (trimmed.startsWith('#### ')) {
      return <h5 key={idx} className="text-sm font-semibold mt-3 mb-1 text-gray-800 dark:text-gray-200">{trimmed.replace('#### ', '')}</h5>;
    }
    if (trimmed.startsWith('##### ')) {
      return <h5 key={idx} className="text-sm font-semibold mt-3 mb-1 text-gray-800 dark:text-gray-200">{trimmed.replace('##### ', '')}</h5>;
    }
    // 处理 **加粗文本**：内容 或 **加粗文本**：
    if (trimmed.startsWith('**') && trimmed.includes('**')) {
      const match = trimmed.match(/^\*\*(.+?)\*\*[：:]\s*(.*)$/);
      if (match) {
        return <p key={idx} className="ml-4 text-gray-700 dark:text-gray-300 leading-relaxed"><span className="font-bold text-gray-900 dark:text-white">{match[1]}</span>：{parseInline(match[2])}</p>;
      }
    }
    if (trimmed.match(/^\d+\./)) {
      return <p key={idx} className="ml-4 text-gray-700 dark:text-gray-300 leading-relaxed">{parseInline(trimmed)}</p>;
    }
    if (trimmed.startsWith('- ')) {
      return <p key={idx} className="ml-4 text-gray-700 dark:text-gray-300 leading-relaxed">• {parseInline(trimmed.replace('- ', ''))}</p>;
    }
    if (trimmed === '') {
      return <div key={idx} className="h-2" />;
    }
    return <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed">{parseInline(trimmed)}</p>;
  });
}

// ========== 辅助函数：缩短技能名称（用于图表图例和tooltip） ==========
function getShortSkillName(name: string): string {
  const trimmed = name.trim();
  const maxLen = 8;
  if (trimmed.length <= maxLen) return trimmed;

  // 对常见长名称做特定缩短（支持中英文括号）
  const normalized = trimmed
    .replace(/[（(]/g, '(')
    .replace(/[）)]/g, ')')
    .replace(/[/\/]/g, '/');

  const mapping: Record<string, string> = {
    'AI工具辅助(智能剪辑/数字人)': 'AI工具辅助',
    '个人IP打造与品牌管理': '个人IP打造',
    '互动氛围营造与粉丝运营': '互动氛围',
    '基础数据分析(观众画像)': '基础数据',
    '多平台(抖音/B站/快手)': '多平台',
    '电商带货与商业化变现': '电商带货',
    '直播内容策划与脚本撰写': '直播策划',
    '短视频剪辑与内容二次创作': '短视频剪辑',
    'AI驱动的内容创作与互动': 'AI内容创作',
    '基础编程与自动化工具使用': '编程自动化',
    '多平台整合运营与数据分析': '多平台运营',
    '直播电商与商业化变现': '直播电商',
    '短/中视频内容策划与剪辑': '视频策划',
    '社群运营与粉丝关系管理': '社群运营',
    '虚拟形象(虚拟主播/VTuber)技术应用': '虚拟形象',
    '跨领域知识融合(如电竞解说、游戏文化)': '跨领域知识',
  };

  // 尝试多种匹配方式
  if (mapping[trimmed]) return mapping[trimmed];
  if (mapping[normalized]) return mapping[normalized];

  // 如果名称包含括号，提取括号前的部分
  const bracketMatch = trimmed.match(/^([^（(]+)[（(]/);
  if (bracketMatch && bracketMatch[1].trim().length >= 2) {
    const prefix = bracketMatch[1].trim();
    if (prefix.length <= maxLen) return prefix;
    return prefix.slice(0, maxLen) + '...';
  }

  return trimmed.slice(0, maxLen) + '...';
}

// ========== 辅助函数：将trends数组转换为Recharts需要的格式 ==========
function prepareChartData(trends: Array<{ skill: string; '2024': number; '2025': number; '2026': number }>) {
  const years = ['2024', '2025', '2026'];
  return years.map(year => {
    const row: any = { year };
    trends.forEach(t => {
      row[t.skill] = t[year as '2024' | '2025' | '2026'];
    });
    return row;
  });
}
