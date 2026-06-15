import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate, useParams } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { getImageUrl } from '../utils/image';
import { useToast } from '../components/Toast';
import { MapPinIcon, CurrencyDollarIcon, BuildingOfficeIcon, FlagIcon, GlobeAltIcon, PhoneIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import ReportModal from '../components/ReportModal';
import ErrorAlert from '../components/ErrorAlert';
import Loading from '../components/Loading';

interface JobDetail {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salaryRange?: string;
  type?: string;
  status: string;
  images?: string[];
  createdAt: string;
  enterprise?: {
    id: string;
    name: string;
    logo?: string;
    description?: string;
    website?: string;
    industry?: string;
    size?: string;
    location?: string;
    contactEmail?: string;
    contactPhone?: string;
    userId?: string;
    user?: {
      creditScore: number;
    };
  };
  hrAccount?: {
    userId: string;
    name: string;
    isActive: boolean;
  };
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (id) loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await jobAPI.getDetail(id!);
      setJob(data.job);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载职位详情失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="sm" />
      </div>
    );
  }

  if (error || !job) {
    return <ErrorAlert message={error || '职位不存在'} />;
  }

  const images = job.images || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/jobs')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">职位详情</h1>
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：职位详情 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 图片轮播 */}
            {images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="relative h-64 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <img
                    src={getImageUrl(images[currentImageIndex])}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                        {images.map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 职位信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{job?.title || '未知职位'}</h2>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                {job.location && (
                  <span className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                )}
                {job.salaryRange && (
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                    {job.salaryRange}
                  </span>
                )}
                {job.type && (
                  <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded text-xs">
                    {job.type}
                  </span>
                )}
                <span>发布于 {formatDate(job.createdAt)}</span>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">职位描述</h3>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.description}</div>
              </div>

              {job.requirements && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">任职要求</h3>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.requirements}</div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：公司信息 + 操作 */}
          <div className="space-y-6">
            {/* 操作按钮 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-3">
              <button
                onClick={() => navigate(`/jobs/${job.id}/apply`)}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors"
              >
                立即申请
              </button>
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    navigate('/login');
                    return;
                  }
                  const hrUserId = job.hrAccount?.userId;
                  if (hrUserId) {
                    const hrName = job.hrAccount?.name || '';
                    navigate(`/messages/${hrUserId}?jobId=${job.id}&name=${encodeURIComponent(hrName)}&jobTitle=${encodeURIComponent(job.title)}`);
                  } else {
                    showToast('该岗位暂未分配HR负责人，请稍后再试', 'info');
                  }
                }}
                className="w-full py-2.5 px-4 border border-brand-600 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
              >
                与HR沟通
              </button>
              {job.enterprise?.userId && (
                <button
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      navigate('/login');
                      return;
                    }
                    setShowReport(true);
                  }}
                  className="w-full py-2.5 px-4 border border-red-300 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                >
                  <FlagIcon className="w-4 h-4" />
                  举报企业
                </button>
              )}
            </div>

            {/* 举报弹窗 */}
            {showReport && job.enterprise?.userId && (
              <ReportModal targetId={job.enterprise.userId} onClose={() => setShowReport(false)} />
            )}

            {/* 公司信息 */}
            {job.enterprise && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  {job.enterprise.logo ? (
                    <img src={getImageUrl(job.enterprise.logo)} alt="" className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                      <BuildingOfficeIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{job.enterprise.name}</h3>
                    {job.enterprise.industry && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{job.enterprise.industry}</p>
                    )}
                  </div>
                </div>
                {job.enterprise.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{job.enterprise.description}</p>
                )}

                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  {job.enterprise.location && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 shrink-0" />
                      <span>{job.enterprise.location}</span>
                    </div>
                  )}
                  {job.enterprise.website && (
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="w-4 h-4 shrink-0" />
                      <a href={job.enterprise.website.startsWith('http') ? job.enterprise.website : `https://${job.enterprise.website}`}
                         target="_blank" rel="noopener noreferrer"
                         className="text-brand-600 dark:text-brand-400 hover:underline truncate">
                        {job.enterprise.website}
                      </a>
                    </div>
                  )}
                  {job.enterprise.contactEmail && (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4 shrink-0" />
                      <span>{job.enterprise.contactEmail}</span>
                    </div>
                  )}
                  {job.enterprise.contactPhone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 shrink-0" />
                      <span>{job.enterprise.contactPhone}</span>
                    </div>
                  )}
                  {job.enterprise.size && (
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4 shrink-0" />
                      <span>规模：{job.enterprise.size}</span>
                    </div>
                  )}
                  {job.enterprise.user?.creditScore != null && (
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className={`w-4 h-4 shrink-0 ${
                        job.enterprise.user.creditScore >= 80 ? 'text-green-500' :
                        job.enterprise.user.creditScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                      <span>信用分：{job.enterprise.user.creditScore}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
