import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { useToast } from '../components/Toast'
import type { ReportData, InterviewData, QuestionReview as QuestionReviewType, AnswerData } from '../types/report'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import { useTheme } from '../context/ThemeContext'
import { interviewAPI } from '../services/api'

// ═══════════════════════════════════════════════════
// 子组件：数字滚动
// ═══════════════════════════════════════════════════
function AnimatedScore({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const startTime = useRef<number | null>(null)
  const animFrame = useRef<number | null>(null)

  useEffect(() => {
    setDisplay(0)
    startTime.current = null
    if (animFrame.current) cancelAnimationFrame(animFrame.current)
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setDisplay(Math.floor(eased * value))
      if (progress < 1) {
        animFrame.current = requestAnimationFrame(animate)
      }
    }
    animFrame.current = requestAnimationFrame(animate)
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current) }
  }, [value, duration])

  return <span>{display}</span>
}

// ═══════════════════════════════════════════════════
// 子组件：顶部总分英雄区
// ═══════════════════════════════════════════════════
function ScoreHero({ overallScore, interview, avgScore, passInfo }: {
  overallScore: number
  interview: InterviewData
  avgScore: number
  passInfo: { text: string; color: string }
}) {
  return (
    <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-8 sm:p-10 mb-8 text-white overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white dark:bg-gray-900/5 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white dark:bg-gray-900/5 rounded-full -ml-24 -mb-24" />
      <div className="relative flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
        <div className="text-center sm:text-left">
          <div className="text-sm font-medium text-indigo-200 mb-2">{interview.title}</div>
          <div className="flex items-baseline gap-2 justify-center sm:justify-start">
            <span className="text-7xl sm:text-8xl font-black tabular-nums">
              <AnimatedScore value={overallScore} />
            </span>
            <span className="text-2xl sm:text-3xl text-indigo-200 font-light">/ 100</span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mt-3 ${passInfo.color} bg-white dark:bg-gray-900/90`}>
            {overallScore >= 60 ? '✅' : '⚠️'} {passInfo.text}
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {[
            { icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: interview.position || '通用岗位' },
            { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: interview.difficulty === 'EASY' ? '简单' : interview.difficulty === 'HARD' ? '困难' : '中等' },
            { icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.11 3.666-.466.339-.738.601-.896.864L8.61 11.9c.496-1.02.738-1.923.738-2.7 0-.723-.13-1.223-.406-1.56-.268-.321-.443-.44-.736-.71-.147-.105-.303-.214-.455-.352z', label: `${interview.answers?.length || 0} 道题 · 平均得分 ${avgScore.toFixed(1)}/10` },
            { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: interview.duration ? `${Math.floor(interview.duration / 60)}分${interview.duration % 60}秒` : '--' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-indigo-100">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// 子组件：能力维度雷达图
// ═══════════════════════════════════════════════════
function DimensionSection({ radarData }: { radarData: { dimension: string; score: number }[] }) {
  if (radarData.length === 0) return null
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">📊</span>
        能力维度分析
      </h2>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Radar name="得分" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════
// 子组件：面试数据统计
// ═══════════════════════════════════════════════════
function StatsSection({ stats, actualDuration }: { stats: ReportData['interview_stats']; actualDuration?: number }) {
  if (!stats || Object.keys(stats).length === 0) return null
  const duration = actualDuration ?? stats.total_duration ?? 0
  const items = [
    { label: '总题目数', value: stats.total_questions, unit: '道', color: 'text-indigo-600' },
    { label: '总时长', value: duration > 0 ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}` : '--', unit: '', color: 'text-indigo-600' },
    { label: '平均回答长度', value: stats.avg_answer_length, unit: '字', color: 'text-indigo-600' },
    { label: '高分题目(≥8)', value: stats.high_score_questions, unit: '道', color: 'text-green-600' },
    { label: '低分题目(≤5)', value: stats.low_score_questions, unit: '道', color: 'text-red-600' },
  ]
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">📈</span>
        面试数据统计
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <div className={`text-2xl font-black ${item.color}`}>{typeof item.value === 'number' ? item.value : item.value}{typeof item.value === 'number' && item.unit ? <span className="text-base font-normal text-gray-400 dark:text-gray-500">{item.unit}</span> : null}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════
// 子组件：单题回顾卡片
// ═══════════════════════════════════════════════════
function QuestionReviewCard({ qr, isExpanded, onToggle }: {
  qr: QuestionReviewType & { question_num: number }
  isExpanded: boolean
  onToggle: () => void
}) {
  const getScoreBg = (score: number) => {
    if (score >= 8) return 'from-green-400 to-emerald-500'
    if (score >= 6) return 'from-yellow-400 to-amber-500'
    return 'from-red-400 to-rose-500'
  }
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-950 transition-colors">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 bg-gradient-to-br ${getScoreBg(qr.score)}`}>
          {qr.question_num}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{qr.question}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">点击展开查看回答和评价</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold shrink-0 ${qr.score >= 8 ? 'bg-green-100 text-green-700' : qr.score >= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {qr.score}分
        </div>
        <svg className={`w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-400">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">面试官提问</div>
              <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{qr.question}</div>
            </div>
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400">
              <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">你的回答</div>
              <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{qr.answer}</div>
            </div>
            {qr.comment && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400">
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">面试官评价（{qr.score}/10分）</div>
                <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{qr.comment}</div>
              </div>
            )}
            {qr.highlights && qr.highlights.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-400">
                <div className="text-xs font-semibold text-emerald-700 mb-2">✅ 回答亮点</div>
                <ul className="space-y-1">
                  {qr.highlights.map((h: string, i: number) => (
                    <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-400">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {qr.improvements && qr.improvements.length > 0 && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400">
                <div className="text-xs font-semibold text-blue-700 mb-2">💡 可改进点</div>
                <ul className="space-y-1">
                  {qr.improvements.map((imp: string, i: number) => (
                    <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="mt-0.5 text-blue-400">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// 子组件：综合建议（优势 + 改进）
// ═══════════════════════════════════════════════════
function SuggestionSection({ strengths, improvements }: { strengths: string[]; improvements: string[] }) {
  if (strengths.length === 0 && improvements.length === 0) return null
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">💡</span>
        综合建议
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strengths.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2"><span>✅</span>优势分析</h3>
            <ul className="space-y-3">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600 leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {improvements.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-2"><span>📈</span>改进建议</h3>
            <ul className="space-y-3">
              {improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">!</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600 leading-relaxed">{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════
export default function InterviewReport() {
  const { dark, toggleTheme } = useTheme()

  const { id } = useParams<{ id: string }>()
  const [interview, setInterview] = useState<InterviewData | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const reportRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  // ── 数据获取 ──────────────────────────────────────
  useEffect(() => { fetchInterview() }, [id])

  // 后端没有 duration 字段，根据 startedAt / completedAt 计算
  const calcDuration = (iv: InterviewData) => {
    if (!iv.duration && iv.startedAt && iv.completedAt) {
      const start = new Date(iv.startedAt).getTime()
      const end = new Date(iv.completedAt).getTime()
      iv.duration = Math.max(0, Math.round((end - start) / 1000))
    }
    return iv
  }

  const fetchInterview = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await interviewAPI.getDetail(token!, id!) as unknown as InterviewData & { feedback?: Record<string, unknown> }
      setInterview(calcDuration(res))
      if (res.feedback && Object.keys(res.feedback).length > 0) {
        setReport(res.feedback)
        setLoading(false)
      } else {
        generateReport()
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '获取面试报告失败')
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      const token = localStorage.getItem('token')
      const res = await interviewAPI.generateReport(token!, id!) as unknown as { report: ReportData; interview: InterviewData }
      setReport(res.report)
      setInterview(calcDuration(res.interview))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '生成报告失败')
    } finally {
      setGenerating(false)
      setLoading(false)
    }
  }

  // ── 工具函数 ──────────────────────────────────────
  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const getPassLabel = (score: number) => {
    if (score >= 80) return { text: '表现优秀', color: 'bg-green-100 text-green-700' }
    if (score >= 60) return { text: '表现良好', color: 'bg-blue-100 text-blue-700' }
    return { text: '需要改进', color: 'bg-red-100 text-red-700' }
  }

  // ── 衍生数据（useMemo）────────────────────────────
  const answers = useMemo(() => interview?.answers || [], [interview])
  const avgScore = useMemo(() => interview?.score || 0, [interview])
  const overallScore = useMemo(() => report?.overall_score || Math.round(avgScore * 10), [report, avgScore])
  const passInfo = useMemo(() => getPassLabel(overallScore), [overallScore])
  const dimensionScores = useMemo(() => report?.dimension_scores || {}, [report])
  const questionReviews = useMemo(() => report?.question_reviews || [], [report])
  const strengths = useMemo(() => report?.strengths || [], [report])
  const improvements = useMemo(() => report?.improvements || [], [report])
  const interviewStats = useMemo(() => report?.interview_stats || {}, [report])
  const radarData = useMemo(() =>
    Object.entries(dimensionScores).map(([key, value]) => ({
      dimension: key,
      score: typeof value === 'number' ? value : 0
    })),
    [dimensionScores]
  )

  // ── 操作函数 ──────────────────────────────────────
  const handleCopyReport = async () => {
    const parts: string[] = []
    parts.push(`面试报告 — ${interview?.title || ''}`)
    parts.push(`总分：${overallScore}/100  岗位：${interview?.position || '通用岗位'}`)
    parts.push(`题目：${answers.length}道  平均：${avgScore.toFixed(1)}/10`)
    parts.push(``)
    parts.push(`— 能力维度 —`)
    radarData.forEach(d => parts.push(`  ${d.dimension}：${d.score}分`))
    parts.push(``)
    parts.push(`— 各题回顾 —`)
    answers.forEach((a, i) => {
      parts.push(`  Q${i + 1}：${a.question}`)
      parts.push(`  答：${(a.answer || '').slice(0, 200)}`)
      parts.push(`  分：${a.score}/10`)
    })
    parts.push(``)
    parts.push(`— 优势 —`)
    strengths.forEach(s => parts.push(`  ✓ ${s}`))
    parts.push(``)
    parts.push(`— 改进 —`)
    improvements.forEach(imp => parts.push(`  • ${imp}`))
    if (report?.final_advice) {
      parts.push(``)
      parts.push(`— AI建议 —`)
      parts.push(report.final_advice)
    }
    try {
      await navigator.clipboard.writeText(parts.join('\n'))
      showToast('报告已复制到剪贴板！', 'success')
    } catch {
      showToast('复制失败，请手动复制', 'error')
    }
  }

  const handleShareLink = async () => {
    const url = `${window.location.origin}/interviews/${id}/report`
    try {
      await navigator.clipboard.writeText(url)
      showToast('报告链接已复制，可分享给朋友查看', 'success')
    } catch {
      showToast('复制链接失败', 'error')
    }
  }

  const handleExportPDF = async () => {
    showToast('正在生成 PDF，请稍候...', 'info')
    try {
      const element = reportRef.current
      if (!element) return
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f9fafb',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }
      pdf.save(`面试报告_${interview?.title || 'report'}.pdf`)
      showToast('PDF 已导出！', 'success')
    } catch (err) {
      console.error('PDF export failed:', err)
      showToast('PDF 导出失败，请重试', 'error')
    }
  }

  // ── 加载/错误状态 ─────────────────────────────────
  if (loading || generating) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${dark ? 'bg-gray-950' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
        <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          {generating ? 'AI 正在生成面试报告...' : '加载中...'}
        </p>
        {generating && (
          <div className="text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">分析面试表现，生成详细评估</p>
            <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </div>
        <p className="text-red-600 dark:text-red-400 font-medium mb-2">出错了</p>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm">{error}</p>
        <button onClick={() => navigate('/interviews')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
          返回面试列表
        </button>
      </div>
    </div>
  )

  if (!interview) return null

  // ── 主渲染 ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" ref={reportRef}>
      {/* 打印样式 */}
      <style>{`
        @media print {
          @page { margin: 15mm; size: A4; }
          nav, .no-print, button { display: none !important; }
          .min-h-screen { min-height: auto !important; }
          .bg-gradient-to-br { background: #4f46e5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .rounded-3xl, .rounded-2xl { border-radius: 12px !important; box-shadow: none !important; border: 1px solid #e5e7eb !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/interviews')} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="返回面试列表">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">面试报告</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShareLink} className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden sm:flex items-center gap-1.5">
              分享链接
            </button>
            <button onClick={handleCopyReport} className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden sm:flex items-center gap-1.5">
              复制报告
            </button>
            <button onClick={() => window.print()} className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden sm:flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6m-6 4v1a1 1 0 001 1h4a1 1 0 001-1v-1m-6 0h6" /></svg>
              打印
            </button>
            <button onClick={handleExportPDF} className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden sm:flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              导出PDF
            </button>
            <button onClick={() => navigate('/interviews/new')} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium">
              再来一场
            </button>
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
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ScoreHero overallScore={overallScore} interview={interview} avgScore={avgScore} passInfo={passInfo} />
        <DimensionSection radarData={radarData} />
        <StatsSection stats={interviewStats} actualDuration={interview.duration} />

        {/* 各题回顾 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm">📝</span>
            各题回顾
          </h2>
          <div className="space-y-4">
            {(questionReviews.length > 0 ? questionReviews : answers).map((item: QuestionReviewType | AnswerData, index: number) => {
              const qr = questionReviews.length > 0 ? item as QuestionReviewType & { question_num: number } : { question: item.question, answer: item.answer, score: item.score, comment: item.comment, question_num: index + 1 } as QuestionReviewType & { question_num: number }
              return (
                <QuestionReviewCard
                  key={index}
                  qr={qr}
                  isExpanded={expandedQuestions.has(index)}
                  onToggle={() => toggleQuestion(index)}
                />
              )
            })}
          </div>
        </section>

        <SuggestionSection strengths={strengths} improvements={improvements} />

        {/* 最终建议 */}
        {report?.final_advice && (
          <section className="mb-8">
            <div className={`rounded-2xl p-6 sm:p-8 border border-indigo-100 dark:border-indigo-800 ${dark ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
              <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343 5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548-.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                AI 面试官的最终建议
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{report.final_advice}</p>
            </div>
          </section>
        )}

        {/* 底部操作区 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 pb-12 no-print">
          <button onClick={() => navigate('/interviews/new')} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            再来一场面试
          </button>
          <button onClick={() => navigate('/interviews')} className="px-8 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            查看所有面试
          </button>
          <button onClick={() => window.print()} className="px-8 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 dark:text-gray-600 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-950 hover:border-gray-300 dark:border-gray-600 transition-all flex items-center justify-center gap-2 sm:hidden">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6m-6 4v1a1 1 0 001 1h4a1 1 0 001-1v-1m-6 0h6" /></svg>
            打印报告
          </button>
        </div>
      </div>
    </div>
  )
}
