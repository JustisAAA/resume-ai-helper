import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminAPI } from '../services/api';
import ErrorAlert from '../components/ErrorAlert';
import Loading from '../components/Loading';

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L6.75 9m9.193 8.132a2.25 2.25 0 00-2.136-2.796L9 5.25m6.758 5.172a2.25 2.25 0 00-2.066-1.856L12.75 3.75m0 0l-.75.75m.75-.75l.75.75M12.75 3.75H9.75m3 0H6.75m0 0L5.25 3.75M6.75 3.75L9 5.25m0 0l2.25 1.5" />
  </svg>
);

export default function AdminResumes() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState('');
  const token = localStorage.getItem('token');

  const fetchData = () => {
    if (!token) return;
    setError('');
    adminAPI.getResumes(token, { page, pageSize: 10, search })
      .then(res => setData(res))
      .catch(err => setError(err.message || '获取失败'));
  };

  useEffect(() => { fetchData(); }, [token, page]);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`确认删除简历「${title}」？`)) return;
    if (!token) return;
    setActionLoading(id);
    adminAPI.deleteResume(token, id)
      .then(() => fetchData())
      .catch(err => { setError(err.message || '删除失败'); setActionLoading(''); });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  if (!data && !error) return <AdminLayout title="简历管理"><Loading /></AdminLayout>;
  if (error) return <AdminLayout title="简历管理"><ErrorAlert message={error} onClose={() => setError('')} /></AdminLayout>;

  return (
    <AdminLayout title="简历管理">
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索简历标题..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500/30 outline-none" />
        </div>
        <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition-colors">搜索</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">标题</th>
                <th className="px-4 py-3 text-left">所属用户</th>
                <th className="px-4 py-3 text-left">状态</th>
                <th className="px-4 py-3 text-center">评分</th>
                <th className="px-4 py-3 text-left">上传时间</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data?.resumes.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{r.title}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.user?.name || r.user?.email || '-'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${r.status === 'ANALYZED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.status === 'ANALYZED' ? '已分析' : r.status === 'DRAFT' ? '草稿' : '已归档'}</span></td>
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
