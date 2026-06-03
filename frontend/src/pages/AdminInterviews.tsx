import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminAPI } from '../services/api';
import ErrorAlert from '../components/ErrorAlert';
import Loading from '../components/Loading';

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export default function AdminInterviews() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState('');
  const token = localStorage.getItem('token');

  const fetchData = () => {
    if (!token) return;
    setError('');
    adminAPI.getInterviews(token, { page, pageSize: 10 })
      .then(res => setData(res))
      .catch(err => setError(err.message || '获取失败'));
  };

  useEffect(() => { fetchData(); }, [token, page]);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`确认删除面试「${title}」？`)) return;
    if (!token) return;
    setActionLoading(id);
    adminAPI.deleteInterview(token, id)
      .then(() => fetchData())
      .catch(err => { setError(err.message || '删除失败'); setActionLoading(''); });
  };

  if (!data && !error) return <AdminLayout title="面试管理"><Loading /></AdminLayout>;
  if (error) return <AdminLayout title="面试管理"><ErrorAlert message={error} onClose={() => setError('')} /></AdminLayout>;

  const statusLabel: Record<string, string> = { CREATED: '未开始', IN_PROGRESS: '进行中', COMPLETED: '已完成' };

  return (
    <AdminLayout title="面试管理">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">标题</th>
                <th className="px-4 py-3 text-left">所属用户</th>
                <th className="px-4 py-3 text-left">岗位</th>
                <th className="px-4 py-3 text-left">状态</th>
                <th className="px-4 py-3 text-center">评分</th>
                <th className="px-4 py-3 text-left">时间</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data?.interviews.map((iv: any) => (
                <tr key={iv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{iv.title}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{iv.user?.name || iv.user?.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{iv.position || '-'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${iv.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : iv.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{statusLabel[iv.status] || iv.status}</span></td>
                  <td className="px-4 py-3 text-center">{iv.score ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(iv.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(iv.id, iv.title)} disabled={actionLoading === iv.id}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50">
                      {actionLoading === iv.id ? '...' : <TrashIcon className="w-4 h-4" />}
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
