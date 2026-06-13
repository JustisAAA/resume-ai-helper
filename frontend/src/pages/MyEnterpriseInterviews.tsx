import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import {
  ArrowLeftIcon, PlayCircleIcon, ClockIcon,
  CheckCircleIcon, BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

interface EnterpriseInterview {
  id: string;
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  CREATED: { label: '待开始', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: ClockIcon },
  IN_PROGRESS: { label: '进行中', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: PlayCircleIcon },
  COMPLETED: { label: '已完成', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', icon: CheckCircleIcon },
  ABANDONED: { label: '已放弃', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', icon: ClockIcon },
};

export default function MyEnterpriseInterviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<EnterpriseInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const data = await interviewAPI.list(token, 'ENTERPRISE') as any;
      setInterviews(data.interviews || []);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (interview: EnterpriseInterview) => {
    navigate(`/interviews/${interview.id}/enterprise-room`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="sm" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button + Title */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
                <BuildingOffice2Icon className="w-6 h-6 text-green-600" />
                企业面试
              </h1>
            </div>
            {/* Right: Theme Toggle */}
            <div className="flex items-center gap-2">
<ThemeToggle />

            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
          企业HR为您发送的面试邀请
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {interviews.length === 0 ? (
          <EmptyState title="暂无企业面试邀请" description="还没有收到任何企业的面试邀请" action={{ label: '浏览职位', onClick: () => navigate('/jobs') }} />
        ) : (
          <div className="space-y-3">
            {interviews.map((iv) => {
              const sc = STATUS_CONFIG[iv.status] || STATUS_CONFIG.CREATED;
              const StatusIcon = sc.icon;

              return (
                <div
                  key={iv.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* 面试图标 */}
                      <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                        <BuildingOffice2Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          企业面试邀请
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(iv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {iv.status === 'CREATED' && (
                        <button
                          onClick={() => handleStart(iv)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-brand-600 hover:from-green-600 hover:to-brand-700 rounded-xl transition-all shadow-sm hover:shadow-md"
                        >
                          <PlayCircleIcon className="w-4 h-4" />
                          开始面试
                        </button>
                      )}

                      {iv.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStart(iv)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm"
                        >
                          <PlayCircleIcon className="w-4 h-4" />
                          继续面试
                        </button>
                      )}

                      {iv.status === 'COMPLETED' && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                          面试结果仅企业端可见
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
