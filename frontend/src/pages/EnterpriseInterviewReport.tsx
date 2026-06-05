import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { enterpriseAPI } from '../services/api';
import { DocumentTextIcon, ArrowPathIcon, ExclamationCircleIcon, ArrowLeftIcon, ChatBubbleOvalLeftIcon, StarIcon } from '@heroicons/react/24/outline';

const EnterpriseInterviewReport: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (interviewId) {
      loadReport(interviewId);
    }
  }, [interviewId]);

  const loadReport = async (id: string) => {
    try {
      setLoading(true);
      const data = await enterpriseAPI.getReport(id);
      setReport(data.report);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载报告失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500"><ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-2" />加载中...</div>;
  if (error) return <div className="p-8 text-center text-red-500"><ExclamationCircleIcon className="mx-auto h-8 w-8 mb-2" />{error}</div>;
  if (!report) return <div className="p-8 text-center text-gray-500"><DocumentTextIcon className="mx-auto h-10 w-10 mb-2 text-gray-400" />报告不存在</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/enterprise/interviews')}
        className="mb-4 text-indigo-600 hover:text-indigo-900"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" />← 返回面试列表
      </button>

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">面试报告</h1>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>报告ID: {report.id}</p>
          {report.createdAt && (
            <p className="mt-1">生成时间: {new Date(report.createdAt).toLocaleString()}</p>
          )}
        </div>

        {report.content && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-indigo-600" />报告内容</h2>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
              {report.content}
            </div>
          </div>
        )}

        {report.feedback && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><ChatBubbleOvalLeftIcon className="w-5 h-5 text-indigo-600" />反馈</h2>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm">
              {typeof report.feedback === 'string' 
                ? report.feedback 
                : JSON.stringify(report.feedback, null, 2)
              }
            </div>
          </div>
        )}

        {report.score !== undefined && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><StarIcon className="w-5 h-5 text-indigo-600" />评分</h2>
            <div className="text-3xl font-bold text-indigo-600">
              {report.score}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseInterviewReport;
