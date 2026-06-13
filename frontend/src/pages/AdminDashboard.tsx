import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminAPI, AdminStats } from '../services/api';
import ErrorAlert from '../components/ErrorAlert';

/* ── 图标组件 ── */

const PersonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const ReportIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

/* ── 主组件 ── */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    adminAPI.getStats(token)
      .then(setStats)
      .catch(err => setError(err.message || '获取统计数据失败'));
  }, [token]);

  if (error) return <ErrorAlert message={error} onClose={() => setError('')} />;

  /* ── 统计卡片配置 ── */
  const statCards = [
    {
      label: '总用户数',
      value: stats?.userCount ?? '-',
      sub: `${stats?.newUsersToday ?? 0} 今日新增`,
      icon: <PersonIcon className="w-6 h-6" />,
      color: 'blue',
      path: '/admin/users',
    },
    {
      label: '企业数',
      value: stats?.enterpriseCount ?? '-',
      sub: `${stats?.newEnterprisesToday ?? 0} 今日新增`,
      icon: <BuildingIcon className="w-6 h-6" />,
      color: 'indigo',
      path: '/admin/users?role=ENTERPRISE',
    },
    {
      label: '举报信息数',
      value: stats?.reportCount ?? '-',
      sub: stats?.pendingReportCount ? `${stats.pendingReportCount} 条待处理` : '全部已处理',
      icon: <ReportIcon className="w-6 h-6" />,
      color: stats?.pendingReportCount ? 'red' : 'amber',
      path: '/admin/reports',
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; }> = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    indigo: { bg: 'bg-brand-50 dark:bg-brand-900/20', text: 'text-brand-600 dark:text-brand-400' },
    green:  { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
  };

  /* ── 角色分布数据 ── */
  const roleDistribution = [
    { label: '求职者', count: stats?.userRoleCount ?? 0, color: 'bg-blue-500', percent: 0 },
    { label: '企业用户', count: stats?.enterpriseRoleCount ?? 0, color: 'bg-brand-500', percent: 0 },
    { label: '管理员', count: stats?.adminRoleCount ?? 0, color: 'bg-purple-500', percent: 0 },
  ];
  const totalRoles = roleDistribution.reduce((s, r) => s + r.count, 0);
  if (totalRoles > 0) {
    roleDistribution.forEach(r => { r.percent = Math.round((r.count / totalRoles) * 100); });
  }

  /* ── 快捷操作 ── */
  const quickActions = [
    { label: '用户管理', desc: '查看和管理所有用户', icon: <PersonIcon className="w-5 h-5" />, path: '/admin/users', color: 'blue' },
    { label: '举报管理', desc: '处理用户举报信息', icon: <ReportIcon className="w-5 h-5" />, path: '/admin/reports', color: 'red' },
  ];

  return (
    <AdminLayout title="系统概览">
      <div className="space-y-6">
        {/* ── 统计卡片 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map(c => {
            const cs = colorMap[c.color];
            return (
              <div
                key={c.label}
                onClick={() => c.path && navigate(c.path)}
                className={`
                  bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700
                  p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
                  ${c.path ? 'cursor-pointer' : ''}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${cs.bg} ${cs.text}`}>
                    {c.icon}
                  </div>
                  {c.path && (
                    <ArrowRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-1" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{c.value}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── 中部双栏：今日概况 + 角色分布 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 今日概况 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">今日概况</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.newUsersToday ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">新增用户</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats?.newEnterprisesToday ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">新增企业</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.pendingReportCount ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">待处理举报</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.reportCount ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">举报总数</p>
              </div>
            </div>
          </div>

          {/* 角色分布 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <PersonIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">用户角色分布</h3>
            </div>
            <div className="space-y-4">
              {roleDistribution.map(r => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{r.label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {r.count} <span className="text-xs text-gray-400 dark:text-gray-500">({r.percent}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${r.color}`}
                      style={{ width: `${Math.max(r.percent, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* 总用户摘要 */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">平台总用户</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{totalRoles}</span>
            </div>
          </div>
        </div>

        {/* ── 底部：快捷操作 ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BriefcaseIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">快捷操作</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(a => {
              const cs = colorMap[a.color];
              return (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left group"
                >
                  <div className={`p-2 rounded-lg ${cs.bg} ${cs.text}`}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.desc}</p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:translate-x-1 transition-transform" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
