import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enterpriseAPI } from '../services/api';
import { ChartBarIcon, ArrowLeftIcon, ArrowPathIcon, ExclamationCircleIcon, InboxIcon } from '@heroicons/react/24/outline';

interface Interview {
  id: string;
  title: string;
  status: string;
  createdAt: string;
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

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const data = await enterpriseAPI.getInterviews();
      setInterviews(data.interviews || []);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载面试列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CREATED': return '未开始';
      case 'IN_PROGRESS': return '进行中';
      case 'COMPLETED': return '已完成';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500"><ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-2" />加载中...</div>;
  if (error) return <div className="p-8 text-center text-red-500"><ExclamationCircleIcon className="mx-auto h-8 w-8 mb-2" />{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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
          <div className="text-center text-gray-500 mt-8">
            <InboxIcon className="mx-auto h-10 w-10 mb-2 text-gray-400" />
            暂无面试
          </div>
        )}

        {interviews.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
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
                      <div className="text-sm text-gray-900">{interview.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(interview.status)}`}>
                        {getStatusText(interview.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {interview.status === 'COMPLETED' && interview.report ? (
                        <button
                          onClick={() => navigate(`/enterprise/interviews/${interview.id}/report`)}
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                        >
                          <ChartBarIcon className="w-4 h-4 mr-1" />
                          查看报告
                        </button>
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
      </main>
    </div>
  );
};

export default EnterpriseInterviewList;
