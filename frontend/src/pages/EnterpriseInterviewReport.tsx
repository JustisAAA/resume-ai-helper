import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getApiBaseUrl } from '../utils/api';
import { exportReportToPDF } from '../utils/exportPdf';
import { useToast } from '../components/Toast';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell
} from 'recharts';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import {
  ArrowLeftIcon, SparklesIcon,
  CheckBadgeIcon, LightBulbIcon, ExclamationTriangleIcon,
  AcademicCapIcon, ChartBarIcon, ClockIcon, UserIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';

/* ── 数字滚动动画 ── */
function AnimatedScore({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const animFrame = useRef<number | null>(null);

  useEffect(() => {
    setDisplay(0);
    startTime.current = null;
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) animFrame.current = requestAnimationFrame(animate);
    };
    animFrame.current = requestAnimationFrame(animate);
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); };
  }, [value, duration]);

  return <span>{display}</span>;
}

/* ── 颜色工具 ── */
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-brand-600 dark:text-brand-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

const RECOMMENDATION_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string; desc: string }> = {
  STRONGLY_RECOMMEND: { label: '强烈推荐', color: 'text-brand-700 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-900/30', border: 'border-brand-200 dark:border-brand-800', icon: '🌟🌟🌟', desc: '候选人表现优异，强烈建议录用' },
  RECOMMEND: { label: '推荐录用', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', icon: '🌟🌟', desc: '候选人表现良好，建议进入下一轮' },
  PENDING: { label: '待定', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', icon: '⭐', desc: '候选人表现一般，可与其他候选人比较后决定' },
  NOT_RECOMMEND: { label: '不推荐', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', icon: '', desc: '候选人与岗位要求差距较大，建议不录用' },
};

/* ── 时间格式化 ── */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}分${s}秒`;
}

const DIFF_MAP: Record<string, string> = { EASY: '初级', MEDIUM: '中级', HARD: '高级' };

const EnterpriseInterviewReport: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isHrView = location.pathname.startsWith('/hr/');
  const [interview, setInterview] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (interviewId) loadData(interviewId);
  }, [interviewId]);

  const loadData = async (id: string) => {
    try {
      setLoading(true);
      setError('');

      const token = isHrView
        ? localStorage.getItem('hrToken')
        : localStorage.getItem('token');

      // 直接获取面试详情（不再请求 /report，避免不必要的 404）
      const res = await fetch(`${getApiBaseUrl()}/api/enterprise/interviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || '获取面试信息失败');
      }

      const interviewData = json.interview;
      setInterview(interviewData);

      // 检查是否已有 AI 评估数据（存储在 feedback.enterpriseEvaluation）
      if (interviewData.feedback?.enterpriseEvaluation) {
        setEvaluation(interviewData.feedback.enterpriseEvaluation);
      }
    } catch (err: any) {
      const errMsg = err.message || '';
      // 只对非预期的错误显示提示，没有 report 属于正常情况
      if (!errMsg.includes('没有报告')) {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAIEvaluate = async () => {
    if (!interviewId) return;
    setEvaluating(true);
    try {
      const hrToken = localStorage.getItem('hrToken');
      const token = localStorage.getItem('token');
      const authToken = isHrView ? hrToken : token;
      const res = await fetch(`${getApiBaseUrl()}/api/interviews/${interviewId}/ai-evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken || ''}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI评估失败');
      setEvaluation(data.evaluation);
      // AI评估后重新加载面试数据（获取 questions/answers）
      try {
        const res2 = await fetch(`${getApiBaseUrl()}/api/enterprise/interviews/${interviewId}`, {
          headers: { Authorization: `Bearer ${authToken || ''}` }
        });
        const json2 = await res2.json();
        if (res2.ok && json2.interview) {
          setInterview(json2.interview);
        }
      } catch { /* 重载失败不影响评估结果 */ }
    } catch (err: any) {
      showToast(err.message || 'AI评估失败', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  // ── ALL hooks must be BEFORE any early return ──
  const recConfig = evaluation ? RECOMMENDATION_CONFIG[evaluation.recommendation] || RECOMMENDATION_CONFIG.PENDING : null;
  const answers = interview?.answers || [];
  const questions = interview?.questions || [];
  const haveAnswers = Array.isArray(answers) && answers.length > 0;
  const overallScore = evaluation?.overallScore || 0;
  const avgScore = haveAnswers ? answers.reduce((s: number, a: any) => s + (a.score || 0), 0) / answers.length : 0;

  // PDF 导出
  const handleExportPDF = async () => {
    if (!interview || isExporting) return;
    setIsExporting(true);
    showToast('正在生成 PDF，请稍候...', 'info');
    try {
      const el = reportRef.current;
      if (!el) throw new Error('报告元素未找到');
      const safeTitle = (interview.title || '企业面试报告').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      await exportReportToPDF(el, `企业面试报告_${safeTitle}`, {
        title: '企业面试报告',
      });
      showToast('PDF 导出成功！', 'success');
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('PDF 导出失败，请重试', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // 雷达图数据：能力维度
  const radarData = useMemo(() => {
    if (!evaluation?.dimensionScores) return [];
    return Object.entries(evaluation.dimensionScores).map(([key, value]) => ({
      dimension: key,
      score: typeof value === 'number' ? value : 0,
    }));
  }, [evaluation]);

  // 柱状图数据：逐题得分
  const barData = useMemo(() => {
    if (!haveAnswers) return [];
    return answers.map((a: any, i: number) => ({
      name: `Q${i + 1}`,
      score: a.score || 0,
      fullMark: 10,
    }));
  }, [answers, haveAnswers]);

  // ── Early returns AFTER all hooks ──
  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loading size="sm" />
        <p className="text-gray-500">加载报告...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <ErrorAlert message={error} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" ref={reportRef}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 返回按钮 + 导出 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(isHrView ? '/hr/interviews' : '/enterprise/interviews')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            返回面试列表
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-teal-500 rounded-full animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  导出PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========== 顶部总评卡片 ========== */}
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 rounded-3xl p-8 mb-8 text-white overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
          <div className="relative flex flex-col sm:flex-row items-center gap-8">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-brand-200 mb-1">{interview?.title || '面试报告'}</p>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-7xl font-black tabular-nums">
                  {evaluation ? <AnimatedScore value={overallScore} /> : '--'}
                </span>
                <span className="text-2xl text-brand-200 font-light">/ 100</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-white/20">
                {overallScore >= 80 ? '✅' : overallScore >= 60 ? '⚠️' : '❌'} {overallScore >= 80 ? '表现优秀' : overallScore >= 60 ? '表现良好' : '需要改进'}
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {[
                { icon: UserIcon, label: interview?.user?.name || '候选人' },
                { icon: DocumentTextIcon, label: interview?.position || '通用岗位' },
                { icon: ChartBarIcon, label: `${DIFF_MAP[interview?.difficulty] || '中级'} · ${answers.length} 题 · 均分 ${avgScore.toFixed(1)}/10` },
                { icon: ClockIcon, label: interview?.startedAt && interview?.completedAt
                  ? formatDuration(Math.round((new Date(interview.completedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000))
                  : '--' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-brand-100 text-sm">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 未评估时显示按钮 */}
        {!evaluation && (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
            <SparklesIcon className="mx-auto h-10 w-10 text-brand-400 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">尚未进行AI评估</h3>
            <p className="text-gray-500 text-sm mb-4">使用企业智能体对本次面试进行全面评估</p>
            <button onClick={handleAIEvaluate} disabled={evaluating}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50">
              {evaluating ? <Loading size="sm" /> : <SparklesIcon className="w-4 h-4" />}
              {evaluating ? 'AI评估中...' : '开始AI评估'}
            </button>
          </div>
        )}

        {/* ========== AI评估结果 ========== */}
        {evaluation && recConfig && (
          <>
            {/* 推荐指数 */}
            <div className={`rounded-2xl border-2 ${recConfig.border} ${recConfig.bg} p-6 mb-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-70 mb-1">录用建议</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{recConfig.icon}</span>
                    <div>
                      <span className={`text-2xl font-bold ${recConfig.color}`}>{recConfig.label}</span>
                      <p className="text-sm opacity-60 mt-0.5">{recConfig.desc}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-70 mb-1">综合评分</p>
                  <span className={`text-4xl font-black ${getScoreColor(overallScore)}`}>{overallScore}</span>
                  <span className="text-sm opacity-50"> / 100</span>
                </div>
              </div>
            </div>

            {/* 雷达图：能力维度 */}
            {radarData.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">📊</span>
                  能力维度分析
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        formatter={(value: any) => [`${value} 分`, '得分']}
                      />
                      <Radar name="得分" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* 柱状图：逐题得分 */}
            {barData.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">📊</span>
                  逐题得分对比
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }} />
                      <YAxis domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 12 }} tickCount={6} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
                        {barData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.score >= 8 ? '#10b981' : entry.score >= 5 ? '#f59e0b' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* 每题分析 */}
            {haveAnswers && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm">💬</span>
                  面试逐题分析
                </h2>
                <div className="space-y-4">
                  {answers.map((a: any, i: number) => {
                    const qText = a.question || (typeof questions[i] === 'string' ? questions[i] : `第${i + 1}题`);
                    return (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">第{i + 1}题</span>
                          <span className={`ml-auto text-sm font-bold ${a.score >= 8 ? 'text-brand-600' : a.score >= 5 ? 'text-amber-600' : 'text-red-600'}`}>{a.score}分</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">{qText}</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg p-3 whitespace-pre-wrap">{a.answer}</p>
                        <div className="flex gap-3 text-xs">
                          {a.comment && (
                            <div className="flex-1 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2.5">
                              <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">评价</p>
                              <p className="text-gray-600 dark:text-gray-400">{a.comment}</p>
                            </div>
                          )}
                          {a.highlights?.length > 0 && (
                            <div className="flex-1 bg-brand-50 dark:bg-brand-900/10 rounded-lg p-2.5">
                              <p className="font-medium text-brand-700 dark:text-brand-400 mb-1">亮点</p>
                              <ul className="space-y-0.5">{a.highlights.map((h: string, j: number) => <li key={j} className="text-gray-600 dark:text-gray-400">{h}</li>)}</ul>
                            </div>
                          )}
                          {a.improvements?.length > 0 && (
                            <div className="flex-1 bg-red-50 dark:bg-red-900/10 rounded-lg p-2.5">
                              <p className="font-medium text-red-700 dark:text-red-400 mb-1">改进</p>
                              <ul className="space-y-0.5">{a.improvements.map((imp: string, j: number) => <li key={j} className="text-gray-600 dark:text-gray-400">{imp}</li>)}</ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 双列：优势 + 不足 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckBadgeIcon className="w-5 h-5 text-brand-500" />优势
                </h3>
                {evaluation.strengths?.length > 0 ? (
                  <ul className="space-y-2">{evaluation.strengths.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-brand-500 mt-1">•</span><span>{s}</span>
                    </li>
                  ))}</ul>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500 italic">暂无</span>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />不足
                </h3>
                {evaluation.weaknesses?.length > 0 ? (
                  <ul className="space-y-2">{evaluation.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-amber-500 mt-1">•</span><span>{w}</span>
                    </li>
                  ))}</ul>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500 italic">暂无</span>
                )}
              </div>
            </div>

            {/* 改进建议 */}
            {evaluation.suggestions?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <LightBulbIcon className="w-5 h-5 text-amber-500" />改进建议
                </h3>
                <div className="space-y-3">{evaluation.suggestions.map((sg: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-gray-600 dark:text-gray-400">{sg}</span>
                  </div>
                ))}</div>
              </div>
            )}

            {/* 综合评价 */}
            {evaluation.summary && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5 text-brand-500" />综合评价
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{evaluation.summary}</p>
              </div>
            )}

            {/* 面试统计 */}
            {haveAnswers && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-brand-500" />面试统计
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: '总题数', value: answers.length, unit: '题' },
                    { label: '平均分', value: avgScore.toFixed(1), unit: '/10' },
                    { label: '最高分', value: Math.max(...answers.map((a: any) => a.score || 0)), unit: '分' },
                    { label: '最低分', value: Math.min(...answers.map((a: any) => a.score || 0)), unit: '分' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}<span className="text-sm font-normal text-gray-500">{stat.unit}</span></p>
                      <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 重新评估 */}
            <div className="text-center pb-4">
              <button onClick={handleAIEvaluate} disabled={evaluating}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors disabled:opacity-50">
                {evaluating ? <Loading size="sm" /> : <SparklesIcon className="w-4 h-4" />}{evaluating ? 'AI评估中...' : '重新评估'}
              </button>
            </div>
          </>
        )}

        {/* 底部装饰线 */}
        <div className="mt-4 mb-8 border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            AI面试报告 · 仅相关岗位HR可见
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseInterviewReport;
