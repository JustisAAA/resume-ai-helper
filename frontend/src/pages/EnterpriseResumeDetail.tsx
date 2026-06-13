import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { enterpriseAPI } from '../services/api';
import ScoringConfigModal from '../components/ScoringConfigModal';
import { useToast } from '../components/Toast';
import { ArrowLeftIcon,
  DocumentTextIcon, SparklesIcon, DocumentMagnifyingGlassIcon,
  CheckCircleIcon, XCircleIcon,
  ChatBubbleLeftRightIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import StatusBadge from '../components/StatusBadge';

const EnterpriseResumeDetail: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [resume, setResume] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (applicationId) loadResume(applicationId);
  }, [applicationId]);

  const loadResume = async (id: string) => {
    try {
      setLoading(true);
      const data = await enterpriseAPI.getResume(id);
      setResume(data.resume);
      setApplication(data.application);
      setAiAnalysis(data.application?.aiAnalysis || data.resume?.aiAnalysis || null);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载简历失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnalyze = async (scoringConfig: any) => {
    if (!applicationId) return;
    try {
      setAiAnalyzing(true);
      const result = await enterpriseAPI.aiAnalyze(applicationId, scoringConfig);
      setAiAnalysis(result.analysis);
      setShowScoringModal(false);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'AI分析失败', 'error');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!applicationId) return;
    try {
      setStatusUpdating(true);
      await enterpriseAPI.updateStatus(applicationId, status);
      setApplication((prev: any) => ({ ...prev, status }));
    } catch (err: any) {
      showToast(err.response?.data?.error || '状态更新失败', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-brand-600 dark:text-brand-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-brand-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getVerdictStyle = (passed: boolean) => {
    return passed
      ? { text: '建议通过 ✓', bg: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-400', border: 'border-green-200' }
      : { text: '建议不通过 ✗', bg: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-700 dark:text-red-400', border: 'border-red-200' };
  };

  const canAccept = application?.status === 'PENDING' || application?.status === 'REVIEWING';
  const isAccepted = application?.status === 'ACCEPTED';

  if (loading) return (
    <div className="p-8 text-center text-gray-500">
      <Loading size="sm" />
    </div>
  );
  if (error) return <ErrorAlert message={error} />;
  if (!resume) return (
    <div className="p-8 text-center text-gray-500">
      <DocumentTextIcon className="mx-auto h-10 w-10 mb-2 text-gray-400" />
      简历不存在
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-14 items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/enterprise/applications')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-lg font-bold text-gray-900 dark:text-white">简历详情</span>
            {application?.status && (
              <StatusBadge status={application.status} type="application" />
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ======== AI 分析结果 ======== */}
        {aiAnalysis && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-yellow-500" />
                AI 简历分析报告
                <span className="text-xs font-normal text-gray-400 ml-2">
                  (按企业评分标准评估)
                </span>
              </h2>
            </div>

            {/* 综合评分大卡片 */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-6">
                {/* 分数圆圈 */}
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor"
                      className="text-gray-200 dark:text-gray-700" strokeWidth="8" />
                    <circle cx="48" cy="48" r="40" fill="none"
                      stroke="currentColor"
                      className={getScoreColor(aiAnalysis.totalScore)}
                      strokeWidth="8"
                      strokeDasharray={`${(aiAnalysis.totalScore / 100) * 251} 251`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className={`text-2xl font-bold ${getScoreColor(aiAnalysis.totalScore)}`}>
                        {aiAnalysis.totalScore}
                      </span>
                      <span className="block text-[10px] text-gray-400">/100分</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">综合评分</span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getVerdictStyle(aiAnalysis.passed).bg} ${getVerdictStyle(aiAnalysis.passed).textColor} ${getVerdictStyle(aiAnalysis.passed).border}`}>
                      {aiAnalysis.verdict}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getVerdictStyle(aiAnalysis.passed).bg} ${getVerdictStyle(aiAnalysis.passed).textColor} ${getVerdictStyle(aiAnalysis.passed).border}`}>
                      {getVerdictStyle(aiAnalysis.passed).text}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {aiAnalysis.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* 各得分点评分 */}
            {aiAnalysis.scoringPoints && aiAnalysis.scoringPoints.length > 0 && (
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">📊 各得分点评分</h3>
                <div className="space-y-3">
                  {aiAnalysis.scoringPoints.map((point: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-sm text-gray-700 dark:text-gray-300 font-medium">{point.name}</span>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getScoreBg(point.score)}`}
                          style={{ width: `${point.score}%` }}
                        />
                      </div>
                      <span className={`w-8 text-right text-sm font-bold ${getScoreColor(point.score)}`}>{point.score}</span>
                    </div>
                  ))}
                </div>
                {/* 评分标准详情 */}
                {aiAnalysis.scoringPoints.some((p: any) => p.comment) && (
                  <div className="mt-4 space-y-2">
                    {aiAnalysis.scoringPoints.map((point: any, i: number) => (
                      point.comment ? (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="shrink-0 mt-0.5">{point.score >= 85 ? '✅' : point.score >= 70 ? '⚠️' : '❌'}</span>
                          <span><strong>{point.name}</strong>：{point.comment}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 优势与不足 */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
              {aiAnalysis.strengths && aiAnalysis.strengths.length > 0 && (
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">✅ 优势</h3>
                  <ul className="space-y-1.5">
                    {aiAnalysis.strengths.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-green-500 mt-1 shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiAnalysis.weaknesses && aiAnalysis.weaknesses.length > 0 && (
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">⚠️ 不足</h3>
                  <ul className="space-y-1.5">
                    {aiAnalysis.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-red-500 mt-1 shrink-0">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 本次评分标准 */}
            {aiAnalysis.scoringConfig && (
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">📋 本次分析使用的评分标准</h3>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>及格分：{aiAnalysis.scoringConfig.passScore}分</span>
                  <span>优秀分：{aiAnalysis.scoringConfig.excellentScore}分</span>
                  <span>得分点：{aiAnalysis.scoringConfig.scoringPoints?.join('、')}</span>
                </div>
                {aiAnalysis.scoringConfig.criteria && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">标准说明：{aiAnalysis.scoringConfig.criteria}</p>
                )}
                {aiAnalysis.scoringConfig.keyPoints && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">考察要点：{aiAnalysis.scoringConfig.keyPoints}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======== 求职信 ======== */}
        {application?.coverLetter && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-pink-500" />
                求职信
              </h2>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-pink-50 dark:bg-pink-900/10 rounded-xl p-4 border border-pink-100 dark:border-pink-800/30">
                {application.coverLetter}
              </div>
            </div>
          </div>
        )}

        {/* ======== 简历原文 ======== */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DocumentMagnifyingGlassIcon className="w-5 h-5 text-brand-500" />
              简历原文{resume?.fileName ? ` · ${resume.fileName}` : ''}
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldCheckIcon className="w-12 h-12 text-amber-400 mb-3" />
              <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                仅 HR 可查看简历内容
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm">
                企业管理员无需查看简历原文。简历筛选、面试评估由对应的岗位 HR 负责处理。
              </p>
            </div>
          </div>
        </div>

        {/* ======== 操作按钮区 ======== */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* AI分析按钮 */}
              <button
                onClick={() => setShowScoringModal(true)}
                disabled={aiAnalyzing}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all
                  bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {aiAnalyzing ? (
                  <>
                    <Loading size="sm" />
                    分析中...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    {aiAnalysis ? '重新分析' : 'AI 分析'}
                  </>
                )}
              </button>

              {/* 已分析过显示分数 */}
              {aiAnalysis && (
                <span className={`text-sm font-bold ${getScoreColor(aiAnalysis.totalScore)}`}>
                  AI评分 {aiAnalysis.totalScore} 分
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* 联系候选人 — 通过HR子账号 */}
              {application?.user?.id && (
                <span
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                  title="请通过该岗位的HR子账号与候选人沟通"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  通过HR沟通
                </span>
              )}

              {/* 通过/拒绝（仅在PENDING/REVIEWING状态显示） */}
              {canAccept && (
                <>
                  <button
                    onClick={() => handleStatusChange('ACCEPTED')}
                    disabled={statusUpdating}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    通过
                  </button>
                  <button
                    onClick={() => handleStatusChange('REJECTED')}
                    disabled={statusUpdating}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    拒绝
                  </button>
                </>
              )}

              {/* 已通过标记 */}
              {isAccepted && (
                <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <ShieldCheckIcon className="w-4 h-4" />
                  已通过 · 可安排面试
                </span>
              )}

              {/* 已拒绝标记 */}
              {application?.status === 'REJECTED' && (
                <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <XCircleIcon className="w-4 h-4" />
                  已拒绝
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* AI评分标准配置弹窗 */}
      {showScoringModal && (
        <ScoringConfigModal
          onConfirm={handleAiAnalyze}
          onCancel={() => setShowScoringModal(false)}
        />
      )}
    </div>
  );
};

export default EnterpriseResumeDetail;
