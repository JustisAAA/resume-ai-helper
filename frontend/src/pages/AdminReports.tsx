import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminAPI } from '../services/api';
import ErrorAlert from '../components/ErrorAlert';
import Loading from '../components/Loading';

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L6.75 9m9.193 8.132a2.25 2.25 0 00-2.136-2.796L9 5.25m6.758 5.172a2.25 2.25 0 00-2.066-1.856L12.75 3.75m0 0l-.75.75m.75-.75l.75.75M12.75 3.75H9.75m3 0H6.75m0 0L5.25 3.75M6.75 3.75L9 5.25m0 0l2.25 1.5" />
  </svg>
);

export default function AdminReports() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState('');
  const token = localStorage.getItem('token');

  const fetchData = () => {
    if (!token) return;
    setError('');
    adminAPI.getReports(token, { page, pageSize: 10 })
      .then(res => setData(res))
      .catch(err => setError(err.message || '获取失败'));
  };

  useEffect(() => { fetchData(); }, [token, page]);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`确认删除报告「${title}」？`)) return;
    if (!token) return;
    setActionLoading(id);
    adminAPI.deleteReport(token, id)
      .then(() => fetchData())
      .catch(err => { setError(err.message || '删除失败'); setActionLoading(''); });
  };

  if (!data && !error) return <AdminLayout title="报告管理"><Loading /></AdminLayout>;
  if (error) return <AdminLayout title="报告管理"><ErrorAlert message={error} onClose={() => setError('')} /></AdminLayout>;

  return (
    <AdminLayout title="报告管理">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">标题</th>
                <th className="px-4 py-3 text-left">所属用户</th>
                <th className="px-4 py-3 text-left">类型</th>
                <th className="px-4 py-3 text-center">评分</th>
                <th className="px-4 py-3 text-left">时间</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data?.reports.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{r.title}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.user?.name || r.user?.email || '-'}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{r.type === 'RESUME_ANALYSIS' ? '简历分析' : r.type === 'INTERVIEW_REPORT' ? '面试报告' : '综合报告'}</span></td>
                  <td className="px-4 py-3 text-center">{r.score ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(r.id, r.title)} disabled={actionLoading === r.id}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50">
                      {actionLoading === r.id ? '...' : <TrashIcon className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>共 {data.total} 条</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={data.page <= 1} className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-sm">上一页</button>
            <button onClick={() => setPage(p => p + 1)} disabled={data.page >= Math.ceil(data.total / data.pageSize)} className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-sm">下一页</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
