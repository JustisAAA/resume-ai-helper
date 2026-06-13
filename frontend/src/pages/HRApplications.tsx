import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrAPI } from '../services/hrAPI';
import ErrorAlert from '../components/ErrorAlert';
import { getImageUrl } from '../utils/image';
import { useToast } from '../components/Toast';
import ThemeToggle from '../components/ThemeToggle';
import InterviewConfigModal, { InterviewConfig } from '../components/InterviewConfigModal';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import { EyeIcon, CheckCircleIcon, XCircleIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';

export default function HRApplications() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [interviewApp, setInterviewApp] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    try {
      const res = await hrAPI.getApplications(page);
      setApplications(res.data.applications || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (e: any) { setError(e.response?.data?.error || '加载失败'); }
    finally { setLoading(false); }
  };

  const handleStatus = async (id: string, status: string) => {
    setStatusUpdating(id);
    try {
      await hrAPI.updateStatus(id, status);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (e: any) { showToast(e.response?.data?.error || '操作失败', 'error'); }
    finally { setStatusUpdating(null); }
  };

  const handleSendInterview = async (config: InterviewConfig) => {
    if (!interviewApp) return;
    try {
      await hrAPI.createInterview(interviewApp.id, config);
      showToast('面试邀请已发送！', 'success');
      setInterviewApp(null);
    } catch (err: any) {
      showToast(err.response?.data?.error || '发送失败', 'error');
    } finally {
    }
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: '待筛选', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' },
    ACCEPTED: { label: '已通过', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200' },
    REJECTED: { label: '已拒绝', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200' },
    REVIEWING: { label: '审核中', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' },
  };

  if (loading) return <Loading size="sm" />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/hr/dashboard')} className="text-gray-500 hover:text-gray-700">
              ← 返回
            </button>
            <span className="font-bold text-gray-900 dark:text-white">简历筛选</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-6 px-4">
        {error && <ErrorAlert message={error} />}
        {applications.length === 0 ? (
          <EmptyState title="暂无申请" />
        ) : (
          <div className="space-y-4">
            {applications.map(app => {
              const s = statusConfig[app.status] || statusConfig.PENDING;
              return (
                <div key={app.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    {app.user?.avatar ? (
                      <img src={getImageUrl(app.user.avatar)} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold">{app.user?.name?.charAt(0) || '?'}</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{app.user?.name || '未知'}</p>
                      <p className="text-xs text-gray-500">{app.user?.email || ''}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${s.bg} ${s.color}`}>{s.label}</span>
                        {app.aiAnalysis?.totalScore != null && (
                          <span className={`text-xs font-bold ${app.aiAnalysis.totalScore >= 85 ? 'text-brand-600' : app.aiAnalysis.totalScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                            AI {app.aiAnalysis.totalScore}分
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => navigate(`/hr/applications/${app.id}/resume`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100">
                      <EyeIcon className="w-3.5 h-3.5" />查看简历
                    </button>
                    {(app.status === 'PENDING' || app.status === 'REVIEWING') && (
                      <>
                        <button onClick={() => handleStatus(app.id, 'ACCEPTED')} disabled={statusUpdating === app.id}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="通过">
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleStatus(app.id, 'REJECTED')} disabled={statusUpdating === app.id}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="拒绝">
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {app.status === 'ACCEPTED' && (
                      <button onClick={() => setInterviewApp(app)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg hover:from-brand-600 hover:to-brand-700"
                        title="AI面试">
                        <PlayCircleIcon className="w-3.5 h-3.5" />AI面试
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </main>

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
