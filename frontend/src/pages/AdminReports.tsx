import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { reportAPI } from '../services/reportAPI';
import { useToast } from '../components/Toast';
import ErrorAlert from '../components/ErrorAlert';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

interface Complaint {
  id: string;
  reporterId: string;
  targetId: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  handledAt?: string;
  reporter: {
    id: string;
    name?: string;
    email: string;
  };
  target: {
    id: string;
    name?: string;
    email: string;
  };
  handler?: {
    id: string;
    name?: string;
    email: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: '待处理', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
  APPROVED: { label: '已通过', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  REJECTED: { label: '已驳回', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
};

export default function AdminReports() {
  const [reports, setReports] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    loadReports();
  }, [filter, page]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getList(filter || undefined, page);
      setReports(res.data.reports || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载举报列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessing(id);
      await reportAPI.approve(id);
      await loadReports();
    } catch (err: any) {
      showToast(err.response?.data?.error || '操作失败', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessing(id);
      await reportAPI.reject(id);
      await loadReports();
    } catch (err: any) {
      showToast(err.response?.data?.error || '操作失败', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading && reports.length === 0) {
    return (
      <AdminLayout title="举报管理">
        <Loading size="sm" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="举报管理">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* 筛选栏 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: '', label: '全部' },
          { key: 'PENDING', label: '待处理' },
          { key: 'APPROVED', label: '已通过' },
          { key: 'REJECTED', label: '已驳回' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === item.key
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 举报列表 */}
      {reports.length === 0 ? (
        <EmptyState title="暂无举报记录" />
      ) : (
        <div className="space-y-4">
          {reports.map(report => {
            const statusInfo = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
            return (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* 状态 + 举报原因 */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {report.reason}
                      </span>
                    </div>

                    {/* 举报人 → 被举报人 */}
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        举报人：<span className="font-medium text-gray-900 dark:text-white">{report.reporter.name || report.reporter.email}</span>
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        被举报人：<span className="font-medium text-gray-900 dark:text-white">{report.target.name || report.target.email}</span>
                      </span>
                    </div>

                    {/* 详细说明 */}
                    {report.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                        {report.description}
                      </p>
                    )}

                    {/* 时间信息 */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                      <span>举报时间：{formatDate(report.createdAt)}</span>
                      {report.handledAt && <span>处理时间：{formatDate(report.handledAt)}</span>}
                      {report.handler && <span>处理人：{report.handler.name || report.handler.email}</span>}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  {report.status === 'PENDING' && (
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => handleApprove(report.id)}
                        disabled={processing === report.id}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition-colors"
                      >
                        {processing === report.id ? '处理中...' : '通过'}
                      </button>
                      <button
                        onClick={() => handleReject(report.id)}
                        disabled={processing === report.id}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
                      >
                        {processing === report.id ? '处理中...' : '驳回'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </AdminLayout>
  );
}
