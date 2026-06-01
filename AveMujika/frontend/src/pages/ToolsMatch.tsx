import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTheme } from '../context/ThemeContext'
import { toolsAPI } from '../services/api'

interface MatchResult {
  overall_score?: number;
  semantic_score?: number;
  dimension_scores?: Record<string, number>;
  matched_keywords?: string[];
  missing_keywords?: string[];
  analysis?: string;
  suggestions?: string[];
  skill_matrix?: { skill: string; matched: boolean; score: number; resume_evidence?: string; jd_requirement?: string }[];
  overpackaging_words?: { word: string; sentence: string; has_support: boolean }[];
  section_analysis?: { section: string; jd_requirement: string; score: number; analysis: string }[];
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
· 精通 React、Vue 等前端框架，深入掌握组件化开发
· 掌握 JavaScript、TypeScript、HTML、CSS
· 了解 Node.js、Webpack 等工具`

const EXAMPLE_JD = `岗位名称：高级前端开发工程师
公司：某互联网科技公司
工作地点：北京
薪资范围：25-40K·14薪

岗位职责：
1. 负责公司核心产品的前端架构设计和开发工作
2. 参与前端技术选型、方案设计和技术评审
3. 优化前端性能，提升用户体验
4. 指导初中级工程师，组织前端技术分享
5. 参与前端工程化建设，完善 CI/CD 流程

任职要求：
1. 本科及以上学历，计算机相关专业，3年以上前端开发经验
2. 精通 React/Vue 等主流前端框架，理解其设计原理
3. 熟悉 TypeScript，有大型项目开发经验
4. 掌握 Webpack/Vite 等构建工具，了解前端工程化
5. 具备良好的沟通能力和团队协作精神
6. 有性能优化、前端架构设计经验者优先`

export default function ToolsMatch() {
  const { dark, toggleTheme } = useTheme()

  const [resumeActiveTab, setResumeActiveTab] = useState<'upload' | 'text'>('text')
  const [jdActiveTab, setJdActiveTab] = useState<'upload' | 'text'>('text')
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jdFile, setJdFile] = useState<File | null>(null)
  const [parsedResumeText, setParsedResumeText] = useState('')
  const [parsedJdText, setParsedJdText] = useState('')
  const [parsingResume, setParsingResume] = useState(false)
  const [parsingJd, setParsingJd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<MatchResult | null>(null)
  const resumeFileRef = { current: null as HTMLInputElement | null }
  const jdFileRef = { current: null as HTMLInputElement | null }
  const navigate = useNavigate()

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-green-700'
    if (score >= 60) return 'text-yellow-700'
    return 'text-red-700'
  }

  const handleFillExample = (type: 'resume' | 'jd') => {
    if (type === 'resume') setResumeText(EXAMPLE_RESUME)
    else setJdText(EXAMPLE_JD)
  }

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setError('文件大小不能超过 10MB'); return }
    setResumeFile(f); setError(''); setParsingResume(true)
    try {
      const token = localStorage.getItem('token')
      const res = await toolsAPI.parseFile(token!, f)
      setParsedResumeText(res.text || '')
    } catch {
      setError('文件解析失败，请切换"粘贴"模式手动输入')
      setParsedResumeText('')
    } finally { setParsingResume(false) }
  }
  const handleJdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setError('文件大小不能超过 10MB'); return }
    setJdFile(f); setError(''); setParsingJd(true)
    try {
      const token = localStorage.getItem('token')
      const res = await toolsAPI.parseFile(token!, f)
      setParsedJdText(res.text || '')
    } catch {
      setError('文件解析失败，请切换"粘贴"模式手动输入')
      setParsedJdText('')
    } finally { setParsingJd(false) }
  }

  const handleSubmit = async () => {
    const resumeTextToUse = resumeActiveTab === 'text' ? resumeText.trim() : parsedResumeText.trim();
    const jdTextToUse = jdActiveTab === 'text' ? jdText.trim() : parsedJdText.trim();
    if (!resumeTextToUse || !jdTextToUse) { setError('请输入简历内容和职位描述'); return }
    setLoading(true); setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await toolsAPI.match(token!, { resume: resumeTextToUse, jd: jdTextToUse }) as MatchResult
      setResult(res)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '匹配分析失败，请重试')
    } finally { setLoading(false) }
  }

  const handleReset = () => { setResult(null); setResumeText(''); setJdText(''); setResumeFile(null); setJdFile(null); setError('') }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">JD 匹配打分</span>
          </div>
          <button onClick={toggleTheme} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title={dark ? '浅色模式' : '深色模式'}>
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
        {/* Hero 区 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">JD 匹配打分</h1>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">AI 分析简历与职位描述的匹配度，找出差距</p>
        </div>

        {/* 有结果：显示结果 */}
        {result ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">分析结果</h2>
              <button onClick={handleReset} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:bg-indigo-900/20 transition-colors font-medium">
                ← 重新分析
              </button>
            </div>

            {/* 总分 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-rose-50 to-rose-100/50 px-6 py-4 border-b border-rose-200/50 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-5xl font-black ${getScoreTextColor(result.overall_score || 0)}`}>{result.overall_score || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    综合匹配分数
                    {result.semantic_score !== undefined && (
                      <span className="ml-2">· 语义 {result.semantic_score}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 维度分析 */}
            {result.dimension_scores && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 px-6 py-4 border-b border-indigo-200/50">
                  <h3 className="font-bold text-gray-900 dark:text-white">维度分析</h3>
                </div>
                <div className="p-6 space-y-4">
                  {Object.entries(result.dimension_scores).map(([key, val]: [string, number]) => {
                    const labels: Record<string, string> = { hard_skills: '硬技能', soft_skills: '软技能', experience: '经验', education: '学历', potential: '潜力' }
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{labels[key] || key}</span><span className={`font-medium ${getScoreTextColor(val)}`}>{val}</span></div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${getScoreColor(val)}`} style={{ width: `${val}%` }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 关键词分析 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-6 py-4 border-b border-emerald-200/50">
                <h3 className="font-bold text-gray-900 dark:text-white">关键词分析</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-green-700 font-medium mb-2">✓ 已匹配关键词</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.matched_keywords || []).map((kw: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 rounded-lg text-xs">{kw}</span>
                      ))}
                      {(result.matched_keywords || []).length === 0 && <span className="text-xs text-gray-400 dark:text-gray-500">无</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-red-700 font-medium mb-2">✗ 缺失关键词</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.missing_keywords || []).map((kw: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 rounded-lg text-xs">{kw}</span>
                      ))}
                      {(result.missing_keywords || []).length === 0 && <span className="text-xs text-gray-400 dark:text-gray-500">无</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 过度包装词 */}
            {result.overpackaging_words && result.overpackaging_words.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 px-6 py-4 border-b border-yellow-200/50">
                  <h3 className="font-bold text-gray-900 dark:text-white">⚠️ 过度包装词检测</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {result.overpackaging_words.map((item: any, idx: number) => (
                      <div key={idx} className={`p-3 rounded-lg border ${item.has_support ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.has_support ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.word}</span>
                          {!item.has_support && <span className="text-xs text-red-600 font-medium">⚠️ 缺乏支撑</span>}
                          {item.has_support && <span className="text-xs text-green-600">✓ 有支撑</span>}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{item.sentence}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 技能匹配矩阵 */}
            {result.skill_matrix && result.skill_matrix.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 px-6 py-4 border-b border-blue-200/50">
                  <h3 className="font-bold text-gray-900 dark:text-white">🔍 技能匹配矩阵</h3>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 text-gray-600 dark:text-gray-400">技能</th>
                          <th className="text-center py-2 text-gray-600 dark:text-gray-400">匹配</th>
                          <th className="text-right py-2 text-gray-600 dark:text-gray-400">分数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.skill_matrix.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-2 text-gray-800 dark:text-gray-200 font-medium">{item.skill}</td>
                            <td className="py-2 text-center">
                              <span className={`text-xs px-2 py-0.5 rounded ${item.matched ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {item.matched ? '✓' : '✗'}
                              </span>
                            </td>
                            <td className={`py-2 text-right font-medium ${getScoreTextColor(item.score)}`}>{item.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 分析建议 */}
            {result.analysis && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-6 py-4 border-b border-amber-200/50">
                  <h3 className="font-bold text-gray-900 dark:text-white">分析建议</h3>
                </div>
                <div className="p-6"><p className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600 leading-relaxed whitespace-pre-wrap">{result.analysis}</p></div>
              </div>
            )}

            {/* 建议列表 */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 px-6 py-4 border-b border-purple-200/50">
                  <h3 className="font-bold text-gray-900 dark:text-white">💡 改进建议</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    {result.suggestions.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600"><span className="text-indigo-500 mt-0.5">•</span><span>{tip}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 段落分析 */}
            {result.section_analysis && result.section_analysis.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 px-6 py-4 border-b border-teal-200/50">
                  <h3 className="font-bold text-gray-900 dark:text-white">📊 段落匹配分析</h3>
                </div>
                <div className="p-6 space-y-4">
                  {result.section_analysis.map((item: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${getScoreColor(item.score) === 'bg-green-500' ? 'bg-green-50 dark:bg-green-900/20' : getScoreColor(item.score) === 'bg-yellow-500' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{item.section}</span>
                          <span className={`text-sm font-black ${getScoreTextColor(item.score)}`}>{item.score}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">JD要求：{item.jd_requirement}</p>
                      </div>
                      <div className="px-4 py-3"><p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{item.analysis}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* 无结果：输入表单 */
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* 简历输入区 */}
            <div className="border-b border-gray-100 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">简历内容 <span className="text-red-500">*</span></h3>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleFillExample('resume')} className="text-xs text-rose-600 hover:text-rose-800 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors font-medium">✨ 填入示例</button>
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button onClick={() => { setResumeActiveTab('text'); setError('') }} className={`px-3 py-1 text-xs font-medium transition-colors ${resumeActiveTab === 'text' ? 'bg-rose-50 text-rose-600' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50'}`}>粘贴</button>
                    <button onClick={() => { setResumeActiveTab('upload'); setError('') }} className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${resumeActiveTab === 'upload' ? 'bg-rose-50 text-rose-600' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50'}`}>上传</button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {resumeActiveTab === 'upload' ? (
                  <div>
                    <input ref={el => { resumeFileRef.current = el }} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleResumeFileChange} className="hidden" />
                    <div onClick={() => resumeFileRef.current?.click()} className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 hover:border-rose-400 hover:bg-rose-50/30 cursor-pointer transition-colors">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{resumeFile ? <span className="text-rose-600 font-medium">{resumeFile.name}</span> : '点击选择文件'}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                      {parsingResume ? (
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60" strokeDashoffset="10" /></svg>
                          正在解析文件...
                        </span>
                      ) : parsedResumeText ? (
                        <span className="text-green-500">✓ 文件解析成功</span>
                      ) : (
                        '上传文件后将自动解析内容'
                      )}
                    </p>
                  </div>
                ) : (
                  <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={8} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none resize-none text-sm" placeholder="粘贴你的简历内容..." />
                )}
              </div>
            </div>

            {/* JD 输入区 */}
            <div>
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">职位描述（JD）<span className="text-red-500">*</span></h3>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleFillExample('jd')} className="text-xs text-rose-600 hover:text-rose-800 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors font-medium">✨ 填入示例</button>
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button onClick={() => { setJdActiveTab('text'); setError('') }} className={`px-3 py-1 text-xs font-medium transition-colors ${jdActiveTab === 'text' ? 'bg-rose-50 text-rose-600' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50'}`}>粘贴</button>
                    <button onClick={() => { setJdActiveTab('upload'); setError('') }} className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${jdActiveTab === 'upload' ? 'bg-rose-50 text-rose-600' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-50'}`}>上传</button>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                {jdActiveTab === 'upload' ? (
                  <div>
                    <input ref={el => { jdFileRef.current = el }} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleJdFileChange} className="hidden" />
                    <div onClick={() => jdFileRef.current?.click()} className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 hover:border-rose-400 hover:bg-rose-50/30 cursor-pointer transition-colors">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{jdFile ? <span className="text-rose-600 font-medium">{jdFile.name}</span> : '点击选择文件'}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                      {parsingJd ? (
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60" strokeDashoffset="10" /></svg>
                          正在解析文件...
                        </span>
                      ) : parsedJdText ? (
                        <span className="text-green-500">✓ 文件解析成功</span>
                      ) : (
                        '上传文件后将自动解析内容'
                      )}
                    </p>
                  </div>
                ) : (
                  <textarea value={jdText} onChange={e => setJdText(e.target.value)} rows={8} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none resize-none text-sm" placeholder="粘贴职位描述（JD）内容..." />
                )}

                {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 text-sm">{error}</div>}

                <button onClick={handleSubmit} disabled={loading || (resumeActiveTab === 'text' ? !resumeText.trim() : !resumeFile) || (jdActiveTab === 'text' ? !jdText.trim() : !jdFile)} className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? (<> <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> AI 分析中... </>) : (<> <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> AI 匹配分析 </>)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
