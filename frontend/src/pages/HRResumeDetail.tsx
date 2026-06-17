import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrAPI } from '../services/hrAPI';
import ScoringConfigModal from '../components/ScoringConfigModal';
import { getImageUrl } from '../utils/image';
import { useToast } from '../components/Toast';
import ThemeToggle from '../components/ThemeToggle';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import {
  ArrowLeftIcon,
  DocumentTextIcon, SparklesIcon, DocumentMagnifyingGlassIcon,
  CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon, PlayCircleIcon
} from '@heroicons/react/24/outline';
import InterviewConfigModal, { InterviewConfig } from '../components/InterviewConfigModal';

export default function HRResumeDetail() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [resume, setResume] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScoring, setShowScoring] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [interviewApp, setInterviewApp] = useState<any>(null);

  useEffect(() => {
    if (applicationId) {
      hrAPI.getResume(applicationId).then(r => {
        setResume(r.data.resume);
        setApplication(r.data.application);
        setAiAnalysis(r.data.application?.aiAnalysis || null);
        setLoading(false);
      }).catch(e => { setError(e.response?.data?.error || '加载失败'); setLoading(false); });
    }
  }, [applicationId]);

  const handleAiAnalyze = async (config: any) => {
    if (!applicationId) return;
    // 立即关闭弹窗，给用户即时反馈
    setShowScoring(false);
    setAnalyzing(true);
    try {
      const r = await hrAPI.aiAnalyze(applicationId, config);
      setAiAnalysis(r.data.analysis);
    } catch (e: any) { showToast(e.response?.data?.error || 'AI分析失败', 'error'); }
    finally { setAnalyzing(false); }
  };

  const handleStatus = async (status: string) => {
    if (!applicationId) return;
    setStatusUpdating(true);
    try {
      await hrAPI.updateStatus(applicationId, status);
      setApplication((p: any) => ({ ...p, status }));
    } catch (e: any) { showToast(e.response?.data?.error || '操作失败', 'error'); }
    finally { setStatusUpdating(false); }
  };

  const handleSendInterview = async (config: InterviewConfig) => {
    if (!applicationId) return;
    try {
      const res = await hrAPI.createInterview(applicationId, config);
      showToast(res.data.message || '面试邀请已发送！', 'success');
      setInterviewApp(null);
    } catch (err: any) {
      showToast(err.response?.data?.error || '发送失败', 'error');
    }
  };

  const getScoreColor = (s: number) => s >= 85 ? 'text-brand-500' : s >= 70 ? 'text-yellow-500' : 'text-red-500';
  const getScoreBg = (s: number) => s >= 85 ? 'bg-brand-500' : s >= 70 ? 'bg-yellow-500' : 'bg-red-500';

  if (loading) return <Loading size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (!resume) return <div className="p-8 text-center text-gray-500">简历不存在</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/hr/applications')} className="text-gray-500 hover:text-gray-700"><ArrowLeftIcon className="w-5 h-5" /></button>
            <span className="font-bold text-gray-900 dark:text-white">简历详情</span>
            {application?.status && (
              <span className={`px-2 py-0.5 text-xs rounded-full border ${
                application.status === 'ACCEPTED' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
                application.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
              }`}>
                {application.status === 'PENDING' ? '待筛选' : application.status === 'ACCEPTED' ? '已通过' : application.status === 'REJECTED' ? '已拒绝' : application.status}
              </span>
            )}
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-6 px-4 space-y-6">
        {/* AI分析结果 */}
        {aiAnalysis && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-yellow-500" />AI 简历分析报告
              </h2>
            </div>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="8" />
                    <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" className={getScoreColor(aiAnalysis.totalScore)} strokeWidth="8" strokeDasharray={`${(aiAnalysis.totalScore / 100) * 251} 251`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className={`text-2xl font-bold ${getScoreColor(aiAnalysis.totalScore)}`}>{aiAnalysis.totalScore}</span>
                      <span className="block text-[10px] text-gray-400 dark:text-gray-300">/100分</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">综合评分</span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${aiAnalysis.passed ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                      {aiAnalysis.verdict} · {aiAnalysis.passed ? '建议通过' : '建议不通过'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{aiAnalysis.summary}</p>
                </div>
              </div>
            </div>
            {aiAnalysis.scoringPoints?.length > 0 && (
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-white mb-4">📊 各得分点评分</h3>
                <div className="space-y-3">
                  {aiAnalysis.scoringPoints.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-sm text-gray-700 dark:text-gray-200 font-medium">{p.name}</span>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getScoreBg(p.score)}`} style={{ width: `${p.score}%` }} />
                      </div>
                      <span className={`w-8 text-right text-sm font-bold ${getScoreColor(p.score)}`}>{p.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700">
              {aiAnalysis.strengths?.length > 0 && (
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">✅ 优势</h3>
                  <ul className="space-y-1.5">{aiAnalysis.strengths.map((s: string, i: number) => <li key={i} className="text-sm text-gray-600 dark:text-gray-300">• {s}</li>)}</ul>
                </div>
              )}
              {aiAnalysis.weaknesses?.length > 0 && (
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">⚠️ 不足</h3>
                  <ul className="space-y-1.5">{aiAnalysis.weaknesses.map((w: string, i: number) => <li key={i} className="text-sm text-gray-600 dark:text-gray-300">• {w}</li>)}</ul>
                </div>
              )}
            </div>
            {aiAnalysis.scoringConfig && (
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">📋 评分标准：及格{aiAnalysis.scoringConfig.passScore}分 / 优秀{aiAnalysis.scoringConfig.excellentScore}分 / {aiAnalysis.scoringConfig.scoringPoints?.join('、')}</h3>
              </div>
            )}
          </div>
        )}

        {/* 求职信 */}
        {application?.coverLetter && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-brand-500" />求职信
              </h2>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-brand-50 dark:bg-brand-900/10 rounded-xl p-4 border border-brand-100 dark:border-brand-800/30">
                {application.coverLetter}
              </div>
            </div>
          </div>
        )}

        {/* 简历原文 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DocumentMagnifyingGlassIcon className="w-5 h-5 text-brand-500" />简历原文 · {resume.fileName || resume.title || '未命名'}
            </h2>
          </div>
          <div className="p-6">
            {resume.content ? (
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                {typeof resume.content === 'string' ? resume.content : JSON.stringify(resume.content, null, 2)}
              </div>
            ) : resume.rawText ? (
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">{resume.rawText}</div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <DocumentTextIcon className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">暂无简历文本内容</p>
              </div>
            )}
            {/* 下载按钮 */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-3">
              {resume.fileUrl ? (
                <a href={resume.fileUrl.startsWith('http') ? resume.fileUrl : getImageUrl(resume.fileUrl)} target="_blank" rel="noopener noreferrer" download={resume.fileName || 'resume.docx'}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 border border-brand-200">
                  <ArrowDownTrayIcon className="w-4 h-4" />下载原始文件
                  {resume.fileName && <span className="text-xs text-gray-400 ml-1">({resume.fileName})</span>}
                </a>
              ) : null}
              {/* 始终可以从文本内容生成可下载文件 */}
              {((resume.content || resume.rawText)) && (
                <button
                  onClick={() => {
                    const text = resume.content || resume.rawText || '';
                    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${resume.fileName || resume.title || '简历'}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600">
                  <ArrowDownTrayIcon className="w-4 h-4" />下载文本文件(.txt)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowScoring(true)} disabled={analyzing}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 shadow-sm">
              {analyzing ? <><Loading size="sm" />分析中...</> : <><SparklesIcon className="w-4 h-4" />{aiAnalysis ? '重新分析' : 'AI 分析'}</>}
            </button>
            {aiAnalysis && <span className={`text-sm font-bold ${getScoreColor(aiAnalysis.totalScore)}`}>AI评分 {aiAnalysis.totalScore} 分</span>}
          </div>
          <div className="flex items-center gap-3">
            {(application?.status === 'PENDING' || application?.status === 'REVIEWING') && (
              <>
                <button onClick={() => handleStatus('ACCEPTED')} disabled={statusUpdating}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-sm">
                  <CheckCircleIcon className="w-4 h-4" />通过
                </button>
                <button onClick={() => handleStatus('REJECTED')} disabled={statusUpdating}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm">
                  <XCircleIcon className="w-4 h-4" />拒绝
                </button>
              </>
            )}
            {application?.status === 'ACCEPTED' && (
              <button onClick={() => setInterviewApp(application)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-600 hover:to-brand-700 shadow-sm hover:shadow-md transition-all"
                title="AI面试">
                <PlayCircleIcon className="w-4 h-4" />AI面试
              </button>
            )}
            {application?.status === 'REJECTED' && (
              <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <XCircleIcon className="w-4 h-4" />已拒绝
              </span>
            )}
          </div>
        </div>
      </main>

      {showScoring && <ScoringConfigModal onConfirm={handleAiAnalyze} onCancel={() => setShowScoring(false)} />}
      {interviewApp && (
        <InterviewConfigModal
          title="发送AI面试邀请"
          jobTitle={interviewApp.job?.title}
          onConfirm={handleSendInterview}
          onCancel={() => setInterviewApp(null)}
        />
      )}
    </div>
  );
}
