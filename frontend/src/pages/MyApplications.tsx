import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../utils/api';
import { MapPinIcon, CurrencyDollarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

interface Application {
  id: string;
  jobId: string;
  userId: string;
  coverLetter: string;
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  job: {
    id: string;
    title: string;
    location?: string;
    salaryRange?: string;
    type?: string;
    enterprise?: {
      id: string;
      name: string;
      logo?: string;
    };
  };
}

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadApplications();
  }, [page]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(getApiUrl(`/applications/me?page=${page}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '加载失败');
      }
      setApplications(data.applications || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || '加载申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const filteredApps = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading size="sm" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">我的申请</h1>
            </div>
            <div className="flex items-center gap-2">
<ThemeToggle />

            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 筛选栏 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'PENDING', label: '待处理' },
            { key: 'REVIEWING', label: '审核中' },
            { key: 'ACCEPTED', label: '已通过' },
            { key: 'REJECTED', label: '未通过' },
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

        {/* 错误提示 */}
        {error && <ErrorAlert message={error} />}

        {/* 空状态 */}
        {filteredApps.length === 0 ? (
          <EmptyState title="暂无申请记录" description="还没有投递任何职位，去看看有哪些机会吧" action={{ label: '浏览职位', onClick: () => navigate('/jobs') }} />
        ) : (
          /* 申请列表 */
          <div className="space-y-4">
            {filteredApps.map(app => {
              return (
                <div
                  key={app.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* 职位标题 + 状态 */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-brand-600 dark:hover:text-brand-400"
                          onClick={() => app.job?.id && navigate(`/jobs/${app.job.id}`)}
                        >
                          {app.job?.title || '未知职位'}
                        </h3>
                        <StatusBadge status={app.status} type="application" />
                      </div>

                      {/* 企业信息 */}
                      {app.job?.enterprise && (
                        <div className="flex items-center gap-2 mb-2">
                          <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {app.job.enterprise?.name || ''}
                          </span>
                        </div>
                      )}

                      {/* 职位标签 */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                        {app.job?.location && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-3.5 h-3.5" />
                            {app.job.location}
                          </span>
                        )}
                        {app.job?.salaryRange && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CurrencyDollarIcon className="w-3.5 h-3.5" />
                            {app.job.salaryRange}
                          </span>
                        )}
                        {app.job?.type && (
                          <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded text-xs">
                            {app.job.type}
                          </span>
                        )}
                      </div>

                      {/* 申请时间 */}
                      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        申请时间：{formatDate(app.createdAt)}
                      </p>
                    </div>

                    {/* 查看职位按钮 */}
                    <button
                      onClick={() => app.job?.id && navigate(`/jobs/${app.job.id}`)}
                      className="shrink-0 ml-4 px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
                    >
                      查看职位
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </main>
    </div>
  );
}
