import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enterpriseAPI, jobAPI } from '../services/api';
import { getApiBaseUrl } from '../utils/api';
import { getImageUrl } from '../utils/image';
import { useToast } from '../components/Toast';
import InterviewConfigModal, { InterviewConfig } from '../components/InterviewConfigModal';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import StatusBadge from '../components/StatusBadge';
import {
  EyeIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon, ArrowPathIcon,
  InboxIcon, BriefcaseIcon, ChatBubbleLeftRightIcon,
  UserCircleIcon, MagnifyingGlassIcon, ClockIcon,
  DocumentTextIcon, PlayCircleIcon
} from '@heroicons/react/24/outline';

interface Job {
  id: string;
  title: string;
  _count?: { applications: number };
}

interface Application {
  id: string;
  status: string;
  createdAt: string;
  coverLetter?: string;
  aiAnalysis?: {
    totalScore: number;
    passed: boolean;
    verdict: string;
    scoringPoints: { name: string; score: number; comment: string }[];
    strengths: string[];
    weaknesses: string[];
    summary: string;
    scoringConfig: any;
  };
  user: { id: string; name: string; email: string; avatar?: string };
  resume?: {
    id: string;
    title: string;
    content?: any;
    rawText?: string;
    fileName?: string;
    fileUrl?: string;
    fileType?: string;
    analysis?: any;
    score?: number;
    status?: string;
  };
  job: { id: string; title: string };
}

const FILTER_OPTIONS = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING', label: '待筛选' },
  { key: 'ACCEPTED', label: '已通过' },
  { key: 'REJECTED', label: '已拒绝' },
];

const EnterpriseApplications: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [hrMap, setHrMap] = useState<Record<string, { userId: string; name: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: string; label: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [interviewApp, setInterviewApp] = useState<Application | null>(null);
  const [sendingInterview, setSendingInterview] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { loadJobs(); }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadApplications(selectedJobId);
    } else {
      setApplications([]);
    }
  }, [selectedJobId, page]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const enterpriseRes = await enterpriseAPI.getProfile(token || '');
      const data = await jobAPI.list({ enterpriseId: enterpriseRes.enterprise.id, status: 'ACTIVE' });
      setJobs(data.jobs || []);

      // 加载HR账号映射
      try {
        const hrRes = await fetch(`${getApiBaseUrl()}/api/hr/by-enterprise`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (hrRes.ok) {
          const hrData = await hrRes.json();
          const map: Record<string, { userId: string; name: string }> = {};
          (hrData.hrs || []).forEach((hr: any) => {
            if (hr.job?.id && hr.userId) {
              map[hr.job.id] = { userId: hr.userId, name: hr.name };
            }
          });
          setHrMap(map);
        }
      } catch { /* ignore */ }

      if (data.jobs && data.jobs.length > 0) {
        const jobWithApps = data.jobs.find((j: Job) => (j._count?.applications || 0) > 0);
        setSelectedJobId(jobWithApps?.id || data.jobs[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '加载职位失败');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (jobId: string) => {
    try {
      setLoading(true);
      const data = await enterpriseAPI.getApplications(jobId, page);
      setApplications(data.applications || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载申请失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await enterpriseAPI.updateStatus(id, status);
      setConfirmAction(null);
      setRejectReason('');
      if (selectedJobId) loadApplications(selectedJobId);
    } catch (err: any) {
      showToast(err.response?.data?.error || '更新失败', 'error');
    }
  };

  const handleSendInterview = async (config: InterviewConfig) => {
    if (!interviewApp) return;
    setSendingInterview(true);
    try {
      await enterpriseAPI.createInterview(interviewApp.id, config);
      showToast('面试邀请已发送！求职者将在Dashboard看到面试入口。', 'success');
      setInterviewApp(null);
    } catch (err: any) {
      showToast(err.response?.data?.error || '发送面试邀请失败', 'error');
    } finally {
      setSendingInterview(false);
    }
  };

  // 筛选与搜索
  const filteredApps = applications.filter(app => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = app.user?.name?.toLowerCase() || '';
      const email = app.user?.email?.toLowerCase() || '';
      const jobTitle = app.job?.title?.toLowerCase() || '';
      return name.includes(q) || email.includes(q) || jobTitle.includes(q);
    }
    return true;
  });

  // 统计
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const currentJob = jobs.find(j => j.id === selectedJobId);

  if (loading && jobs.length === 0) return <Loading size="sm" />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/enterprise/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <span className="text-xl font-bold text-gray-900 dark:text-white">申请管理</span>
            </div>
            <button
              onClick={() => selectedJobId && loadApplications(selectedJobId)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="刷新"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 职位选择器 */}
        {jobs.length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">选择职位</label>
              <select
                value={selectedJobId}
                onChange={(e) => { setSelectedJobId(e.target.value); setStatusFilter('ALL'); setSearchQuery(''); setPage(1); }}
                className="block w-full max-w-xs px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- 选择职位 --</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job._count?.applications || 0} 个申请)
                  </option>
                ))}
              </select>
              {currentJob && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  当前共 {stats.total} 名候选人
                </span>
              )}
            </div>
          </div>
        )}

        {/* 统计卡片 */}
        {selectedJobId && applications.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: '总数', value: stats.total, color: 'from-brand-500 to-brand-600', icon: BriefcaseIcon },
              { label: '待筛选', value: stats.pending, color: 'from-amber-500 to-orange-500', icon: ClockIcon },
              { label: '已通过', value: stats.accepted, color: 'from-brand-500 to-green-600', icon: CheckCircleIcon },
              { label: '已拒绝', value: stats.rejected, color: 'from-rose-500 to-red-600', icon: XCircleIcon },
            ].map((item) => (
              <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* 搜索 + 筛选栏 */}
        {selectedJobId && applications.length > 0 && (
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索候选人姓名、邮箱..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setStatusFilter(opt.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === opt.key
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {selectedJobId && applications.length === 0 && !loading && (
          <EmptyState icon={<InboxIcon className="w-full h-full" />} title="该职位暂无申请" />
        )}

        {error && <ErrorAlert message={error} />}

        {/* 申请列表 */}
        {selectedJobId && filteredApps.length > 0 && (
          <div className="space-y-4">
            {filteredApps.map((app) => {
              return (
                <div
                  key={app.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-md"
                >
                  {/* 主行 */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* 头像 */}
                    {app.user?.avatar ? (
                      <img
                        src={getImageUrl(app.user.avatar)}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                        <UserCircleIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}

                    {/* 信息区 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">{app.user?.name || '未知用户'}</span>
                        <StatusBadge status={app.status} type="application" />
                        {app.aiAnalysis?.totalScore != null ? (
                          <span className={`shrink-0 px-2 py-0.5 text-xs font-bold rounded-full border ${
                            app.aiAnalysis.totalScore >= 85
                              ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-800'
                              : app.aiAnalysis.totalScore >= 70
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                          }`}>
                            AI评分 {app.aiAnalysis.totalScore}
                            {app.aiAnalysis.verdict && ` · ${app.aiAnalysis.verdict}`}
                          </span>
                        ) : app.resume?.score != null && (
                          <span className="shrink-0 px-2 py-0.5 text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full font-medium">
                            AI评分 {app.resume.score}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>{app.user?.email || '未知邮箱'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{app.job?.title || '未知职位'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{formatDate(app.createdAt)}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* 查看简历 - 跳转到简历详情页 */}
                      {app.resume ? (
                        <button
                          onClick={() => navigate(`/enterprise/applications/${app.id}/resume`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          查看简历
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-default">
                          <DocumentTextIcon className="w-3.5 h-3.5" />
                          无简历
                        </span>
                      )}

                      {/* 通过HR沟通 */}
                      {(() => {
                        const hr = hrMap[app.job?.id || ''];
                        return hr ? (
                          <button
                            onClick={() => {
                              const params = new URLSearchParams();
                              if (app.job?.id) params.set('jobId', app.job.id);
                              params.set('name', hr.name);
                              if (app.job?.title) params.set('jobTitle', app.job.title);
                              navigate(`/enterprise/messages/${hr.userId}?${params.toString()}`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
                            title={`联系 ${hr.name}`}
                          >
                            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                            联系HR
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                            无HR
                          </span>
                        );
                      })()}

                      {/* 状态操作 */}
                      {app.status === 'PENDING' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setConfirmAction({ id: app.id, status: 'ACCEPTED', label: '通过' })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            通过
                          </button>
                          <button
                            onClick={() => setConfirmAction({ id: app.id, status: 'REJECTED', label: '拒绝' })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircleIcon className="w-3.5 h-3.5" />
                            拒绝
                          </button>
                        </div>
                      )}
                      {app.status === 'ACCEPTED' && (
                        <button
                          onClick={() => setInterviewApp(app)}
                          disabled={sendingInterview}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg hover:from-brand-600 hover:to-brand-700 transition-all shadow-sm disabled:opacity-50"
                        >
                          <PlayCircleIcon className="w-3.5 h-3.5" />
                          AI面试
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 简历展开区（已移除，改为跳转到独立详情页） */}
                </div>
              );
            })}

            {filteredApps.length === 0 && searchQuery && (
              <EmptyState size="sm" title="没有匹配的候选人" description="尝试调整筛选条件" />
            )}
          </div>
        )}

        {selectedJobId && <Pagination currentPage={page} totalPages={totalPages} total={total} onPageChange={setPage} />}

        {!selectedJobId && jobs.length === 0 && !loading && (
          <EmptyState
            icon={<BriefcaseIcon className="w-full h-full" />}
            title="还没有发布职位"
            description="发布第一个职位开始招聘"
            action={{ label: '发布职位', onClick: () => navigate('/enterprise/jobs') }}
          />
        )}
      </main>

      {/* 确认对话框 */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              确认{confirmAction.label}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {confirmAction.status === 'ACCEPTED'
                ? '确定要通过该候选人的申请吗？'
                : '确定要拒绝该候选人的申请吗？此操作后候选人将收到通知。'}
            </p>
            {confirmAction.status === 'REJECTED' && (
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="拒绝原因（可选）..."
                className="w-full mb-4 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={2}
              />
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setConfirmAction(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={() => handleStatusChange(confirmAction.id, confirmAction.status)}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                  confirmAction.status === 'ACCEPTED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                确认{confirmAction.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 面试配置弹窗 */}
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
};

export default EnterpriseApplications;
