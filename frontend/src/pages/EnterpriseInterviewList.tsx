import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enterpriseAPI } from '../services/api';
import { ChartBarIcon, ArrowLeftIcon, InboxIcon } from '@heroicons/react/24/outline';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import StatusBadge from '../components/StatusBadge';

interface Interview {
  id: string;
  title: string;
  position?: string;
  status: string;
  createdAt: string;
  feedback?: any;
  user: {
    id: string;
    name: string;
    email: string;
  };
  resume?: {
    id: string;
    title: string;
    score?: number;
  };
  report?: {
    id: string;
    createdAt: string;
  };
}

const EnterpriseInterviewList: React.FC = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadInterviews();
  }, [page]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const data = await enterpriseAPI.getInterviews(page);
      setInterviews(data.interviews || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载面试列表失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="sm" />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/enterprise/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <span className="text-xl font-bold text-gray-900 dark:text-white">面试管理</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {interviews.length === 0 && (
          <EmptyState icon={<InboxIcon className="w-full h-full" />} title="暂无面试" />
        )}

        {interviews.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">候选人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">职位</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interviews.map((interview) => (
                  <tr key={interview.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{interview.user.name}</div>
                        <div className="text-sm text-gray-500">{interview.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{interview.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={interview.status} type="interview" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {interview.status === 'COMPLETED' ? (
                        (interview.report || interview.feedback?.enterpriseEvaluation) ? (
                        <button
                          onClick={() => navigate(`/enterprise/interviews/${interview.id}/report`)}
                          className="inline-flex items-center text-brand-600 hover:text-brand-900"
                        >
                          <ChartBarIcon className="w-4 h-4 mr-1" />
                          查看报告
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/enterprise/interviews/${interview.id}/report`)}
                          className="inline-flex items-center text-brand-600 hover:text-brand-900"
                        >
                          <ChartBarIcon className="w-4 h-4 mr-1" />
                          AI评估
                        </button>
                      )
                      ) : (
                        <span className="text-gray-400">等待中</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </main>
    </div>
  );
};

export default EnterpriseInterviewList;
