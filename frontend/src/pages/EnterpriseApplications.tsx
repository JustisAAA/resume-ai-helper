import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enterpriseAPI, jobAPI } from '../services/api';

interface Job {
  id: string;
  title: string;
  _count?: {
    applications: number;
  };
}

interface Application {
  id: string;
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
  job: {
    id: string;
    title: string;
  };
}

const EnterpriseApplications: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 加载职位列表
  useEffect(() => {
    loadJobs();
  }, []);

  // 当选择职位变化时，加载该职位的申请
  useEffect(() => {
    if (selectedJobId) {
      loadApplications(selectedJobId);
    } else {
      setApplications([]);
    }
  }, [selectedJobId]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobAPI.list({ status: 'ACTIVE' });
      setJobs(data.jobs || []);
      
      // 自动选择第一个有申请的职位
      if (data.jobs && data.jobs.length > 0) {
        const jobWithApps = data.jobs.find((j: Job) => (j._count?.applications || 0) > 0);
        if (jobWithApps) {
          setSelectedJobId(jobWithApps.id);
        } else if (data.jobs.length > 0) {
          setSelectedJobId(data.jobs[0].id);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '加载职位失败');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (jobId: string) => {
    try {
      setLoading(true);
      const data = await enterpriseAPI.getApplications(jobId);
      setApplications(data.applications || []);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载申请失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await enterpriseAPI.updateStatus(id, status);
      alert('更新成功');
      // 重新加载当前职位的申请
      if (selectedJobId) {
        loadApplications(selectedJobId);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || '更新失败');
    }
  };

  const handleViewResume = (applicationId: string) => {
    navigate(`/enterprise/applications/${applicationId}/resume`);
  };

  if (loading && jobs.length === 0) return <div className="p-8 text-center">加载中...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">申请管理</h1>
      
      {/* 职位选择器 */}
      {jobs.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择职位
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- 选择职位 --</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job._count?.applications || 0} 个申请)
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* 申请列表 */}
      {selectedJobId && applications.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">该职位暂无申请</div>
      )}
      
      {selectedJobId && applications.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  候选人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  职位
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  申请时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{app.user.name}</div>
                      <div className="text-sm text-gray-500">{app.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.job.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status === 'PENDING' ? '待筛选' :
                       app.status === 'ACCEPTED' ? '已通过' : '已拒绝'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewResume(app.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      查看简历
                    </button>
                    {app.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.id, 'ACCEPTED')}
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          通过
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'REJECTED')}
                          className="text-red-600 hover:text-red-900"
                        >
                          拒绝
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {!selectedJobId && jobs.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          您还没有发布职位，请先<a href="/enterprise/jobs" className="text-indigo-600">发布职位</a>
        </div>
      )}
    </div>
  );
};

export default EnterpriseApplications;
