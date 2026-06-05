import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { enterpriseAPI } from '../services/api';
import { ArrowLeftIcon, ArrowPathIcon, ExclamationCircleIcon, DocumentTextIcon, SparklesIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

const EnterpriseResumeDetail: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (applicationId) {
      loadResume(applicationId);
    }
  }, [applicationId]);

  const loadResume = async (id: string) => {
    try {
      setLoading(true);
      const data = await enterpriseAPI.getResume(id);
      setResume(data.resume);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载简历失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500"><ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-2" />加载中...</div>;
  if (error) return <div className="p-8 text-center text-red-500"><ExclamationCircleIcon className="mx-auto h-8 w-8 mb-2" />{error}</div>;
  if (!resume) return <div className="p-8 text-center text-gray-500"><DocumentTextIcon className="mx-auto h-10 w-10 mb-2 text-gray-400" />简历不存在</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/enterprise/applications')}
        className="mb-4 text-indigo-600 hover:text-indigo-900"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" />← 返回申请列表
      </button>

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{resume.title || '简历详情'}</h1>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>文件名: {resume.fileName || '未知'}</p>
          {resume.score !== undefined && (
            <p className="mt-1">AI评分: <span className="font-bold text-indigo-600">{resume.score}</span></p>
          )}
          {resume.status && (
            <p className="mt-1">状态: {resume.status}</p>
          )}
        </div>

        {resume.analysis && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-indigo-600" />AI分析</h2>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm">
              {typeof resume.analysis === 'string' 
                ? resume.analysis 
                : JSON.stringify(resume.analysis, null, 2)
              }
            </div>
          </div>
        )}

        {resume.content && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-indigo-600" />简历内容</h2>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
              {resume.content}
            </div>
          </div>
        )}

        {resume.rawText && !resume.content && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><DocumentMagnifyingGlassIcon className="w-5 h-5 text-indigo-600" />简历原文</h2>
            <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
              {resume.rawText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseResumeDetail;
