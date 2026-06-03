import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminAPI, AdminUser, AdminUserListResponse } from '../services/api';
import ErrorAlert from '../components/ErrorAlert';
import Loading from '../components/Loading';

/* ── 图标组件 ── */

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L6.75 9m9.193 8.132a2.25 2.25 0 01-2.136-2.796L9 5.25m6.758 5.172a2.25 2.25 0 00-2.066-1.856L12.75 3.75m0 0l-.75.75m.75-.75l.75.75M12.75 3.75H9.75m3 0H6.75m0 0L5.25 3.75M6.75 3.75L9 5.25m0 0l2.25 1.5" />
  </svg>
);

/* ── 状态/角色颜色映射 ── */

const statusColor: Record<string, string> = {
  ACTIVE:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  BANNED:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const roleColor: Record<string, string> = {
  USER:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const statusLabel: Record<string, string> = { ACTIVE: '正常', INACTIVE: '未激活', BANNED: '已封禁' };
const roleLabel: Record<string, string> = { USER: '普通用户', ADMIN: '管理员' };

/* ── 主组件 ── */

export default function AdminUsers() {
  const [data, setData] = useState<AdminUserListResponse | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState('');

  const token = localStorage.getItem('token');

  const fetchUsers = () => {
    if (!token) return;
    setError('');
    adminAPI.getUsers(token, { page, pageSize: 10, search, role: roleFilter, status: statusFilter })
      .then(res => setData(res))
      .catch(err => setError(err.message || '获取用户列表失败'));
  };

  useEffect(() => { fetchUsers(); }, [token, page, roleFilter, statusFilter]);

  const handleDelete = (user: AdminUser) => {
    if (!confirm(`确认删除用户「${user.name || user.email}」？此操作不可撤回！`)) return;
    if (!token) return;
    setActionLoading(user.id);
    adminAPI.deleteUser(token, user.id)
      .then(() => fetchUsers())
      .catch(err => { setError(err.message || '删除失败'); setActionLoading(''); });
  };

  const handleToggleStatus = (user: AdminUser) => {
    if (!token) return;
    const next = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    setActionLoading(user.id);
    adminAPI.updateUser(token, user.id, { status: next })
      .then(() => fetchUsers())
      .catch(err => { setError(err.message || '操作失败'); setActionLoading(''); });
  };

  const handleToggleRole = (user: AdminUser) => {
    if (!token) return;
    const next = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`确认将「${user.name || user.email}」${next === 'ADMIN' ? '设为管理员' : '取消管理员'}？`)) return;
    setActionLoading(user.id);
    adminAPI.updateUser(token, user.id, { role: next })
      .then(() => fetchUsers())
      .catch(err => { setError(err.message || '操作失败'); setActionLoading(''); });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  if (!data && !error) return <AdminLayout title="用户管理"><Loading /></AdminLayout>;
  if (error) return <AdminLayout title="用户管理"><ErrorAlert message={error} onClose={() => setError('')} /></AdminLayout>;

  return (
    <AdminLayout title="用户管理">
      {/* 搜索栏 + 筛选 */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索邮箱或姓名..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500/30 outline-none"
          />
        </div>
        <select
          value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
        >
          <option value="">全部角色</option>
          <option value="USER">普通用户</option>
          <option value="ADMIN">管理员</option>
        </select>
        <select
          value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
        >
          <option value="">全部状态</option>
          <option value="ACTIVE">正常</option>
          <option value="INACTIVE">未激活</option>
          <option value="BANNED">已封禁</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition-colors">
          搜索
        </button>
      </form>

      {/* 用户表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">邮箱</th>
                <th className="px-4 py-3 text-left">姓名</th>
                <th className="px-4 py-3 text-left">角色</th>
                <th className="px-4 py-3 text-left">状态</th>
                <th className="px-4 py-3 text-center">简历</th>
                <th className="px-4 py-3 text-center">面试</th>
                <th className="px-4 py-3 text-center">报告</th>
                <th className="px-4 py-3 text-left">注册时间</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data?.users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role] || ''}`}>
                      {roleLabel[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[u.status] || ''}`}>
                      {statusLabel[u.status] || u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{u._count?.resumes ?? 0}</td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{u._count?.interviews ?? 0}</td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{u._count?.reports ?? 0}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleToggleRole(u)} disabled={actionLoading === u.id}
                        className="px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                        {u.role === 'ADMIN' ? '取消管理员' : '设为管理员'}
                      </button>
                      <button onClick={() => handleToggleStatus(u)} disabled={actionLoading === u.id}
                        className={`px-2 py-1 text-xs rounded-lg border transition-colors disabled:opacity-50 ${
                          u.status === 'BANNED'
                            ? 'border-green-200 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}>
                        {actionLoading === u.id ? '...' : u.status === 'BANNED' ? '解封' : '封禁'}
                      </button>
                      <button onClick={() => handleDelete(u)} disabled={actionLoading === u.id}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>共 {data.total} 条，第 {data.page} / {Math.ceil(data.total / data.pageSize)} 页</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={data.page <= 1}
              className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-sm">上一页</button>
            <button onClick={() => setPage(p => p + 1)} disabled={data.page >= Math.ceil(data.total / data.pageSize)}
              className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-sm">下一页</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
