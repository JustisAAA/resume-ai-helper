import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate, useParams } from 'react-router-dom';
import { jobAPI, resumeAPI } from '../services/api';
import { getApiUrl } from '../utils/api';
import { useToast } from '../components/Toast';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

interface JobInfo {
  id: string;
  title: string;
  enterprise?: {
    id: string;
    name: string;
  };
}

interface Resume {
  id: string;
  title: string;
}

export default function JobApply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [job, setJob] = useState<JobInfo | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadJob();
      loadResumes();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const data = await jobAPI.getDetail(id!);
      setJob(data.job);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载职位失败');
    }
  };

  const loadResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data: any = await resumeAPI.list(token);
      const resumeList = Array.isArray(data) ? data : (data.resumes || []);
      setResumes(resumeList);
      if (resumeList.length > 0) {
        setSelectedResumeId(resumeList[0].id);
      }
    } catch (err: any) {
      console.error('加载简历列表失败', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      setError('求职信不能为空');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('jobId', id!);
      formData.append('coverLetter', coverLetter);
      if (selectedResumeId) {
        formData.append('resumeId', selectedResumeId);
      }
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await fetch(getApiUrl('/applications'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '提交失败');
      }

      showToast('申请提交成功！', 'success');
      navigate(`/jobs/${id}`);
    } catch (err: any) {
      setError(err.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error ? <div className="text-red-500">{error}</div> : <Loading size="sm" />}
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
                onClick={() => navigate(`/jobs/${id}`)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">申请职位</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/practice')}
                className="px-3 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 border border-brand-600 dark:border-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
              >
                提升能力
              </button>
<ThemeToggle />

            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {/* 职位信息 */}
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{job?.title || '未知职位'}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{job.enterprise?.name}</p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 选择简历 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择简历
              </label>
              {resumes.length > 0 ? (
                <select
                  value={selectedResumeId}
                  onChange={e => setSelectedResumeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              ) : (
                <EmptyState size="sm" title="暂无简历" description="请在下方上传简历" />
              )}
            </div>

            {/* 上传新简历 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                或上传新简历
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <PaperClipIcon className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {resumeFile ? resumeFile.name : '选择 PDF/DOC/DOCX 文件'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={e => setResumeFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* 求职信 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                求职信 *
              </label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                placeholder="请简要介绍自己，说明为什么适合这个职位..."
                required
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/jobs/${id}`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50"
              >
                {submitting ? '提交中...' : '提交申请'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
