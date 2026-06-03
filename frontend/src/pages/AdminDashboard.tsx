import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminAPI } from '../services/api';
import ErrorAlert from '../components/ErrorAlert';

/* ── 图标组件 ── */

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.953 9.953 0 01-5.5-1.375A9.953 9.953 0 015 19.128m10 0a9.953 9.953 0 00-5.5-1.375m5.5 1.375v-.378a6 6 0 00-3.138-5.592m3.138 5.97a6 6 0 01-5.973 0m5.973 0a6 6 0 01-3.138-5.592M12 12.75a3 3 0 11-6 0 3 3 0 016 0zm-3 0a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ResumeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3 3 0 00-3-3H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const InterviewIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ReportIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

/* ── 主组件 ── */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    userCount: number;
    resumeCount: number;
    interviewCount: number;
    reportCount: number;
    newUsersToday: number;
    newResumesToday: number;
  } | null>(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    adminAPI.getStats(token)
      .then(setStats)
      .catch(err => setError(err.message || '获取统计数据失败'));
  }, [token]);

  if (error) return <ErrorAlert message={error} onClose={() => setError('')} />;

  const statCards = [
    { label: '总用户数', value: stats?.userCount ?? '-', icon: <UsersIcon className="w-7 h-7 text-blue-500" />, color: 'blue' },
    { label: '总简历数', value: stats?.resumeCount ?? '-', icon: <ResumeIcon className="w-7 h-7 text-green-500" />, color: 'green' },
    { label: '总面试数', value: stats?.interviewCount ?? '-', icon: <InterviewIcon className="w-7 h-7 text-purple-500" />, color: 'purple' },
    { label: '总报告数', value: stats?.reportCount ?? '-', icon: <ReportIcon className="w-7 h-7 text-amber-500" />, color: 'amber' },
  ];

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green:  'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  };

  return (
    <AdminLayout title="系统概览">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              if (c.label === '总用户数') navigate('/admin/users');
              if (c.label === '总简历数') navigate('/admin/resumes');
              if (c.label === '总面试数') navigate('/admin/interviews');
              if (c.label === '总报告数') navigate('/admin/reports');
            }}>
            <div className={`p-3 rounded-xl ${colorMap[c.color]}`}>{c.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 今日新增 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">今日新增用户</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats?.newUsersToday ?? '-'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">今日新增简历</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.newResumesToday ?? '-'}</p>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快捷操作</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: '用户管理', path: '/admin/users' },
            { label: '简历管理', path: '/admin/resumes' },
            { label: '面试管理', path: '/admin/interviews' },
            { label: '报告管理', path: '/admin/reports' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors text-left">
              {item.label} →
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
