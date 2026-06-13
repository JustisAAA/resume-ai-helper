import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { MapPinIcon, CurrencyDollarIcon, MagnifyingGlassIcon, BuildingOfficeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/image';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';

interface Job {
  id: string;
  title: string;
  description?: string;
  location?: string;
  salaryRange?: string;
  type?: string;
  status: string;
  createdAt: string;
  enterprise?: {
    id: string;
    name: string;
    logo?: string;
    industry?: string;
  };
  _count?: {
    applications: number;
  };
}

export default function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadJobs();
  }, [page]);

  useEffect(() => {
    filterJobs();
  }, [searchKeyword, filterLocation, filterType, jobs]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobAPI.list({ status: 'ACTIVE', page });
      setJobs(data.jobs || []);
      setFilteredJobs(data.jobs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载职位列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let result = [...jobs];
    
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(job => 
        job.title?.toLowerCase().includes(keyword) ||
        job.enterprise?.name.toLowerCase().includes(keyword) ||
        job.description?.toLowerCase().includes(keyword)
      );
    }
    
    if (filterLocation) {
      result = result.filter(job => job.location === filterLocation);
    }
    
    if (filterType) {
      result = result.filter(job => job.type === filterType);
    }
    
    setFilteredJobs(result);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return '今天';
    if (diff === 1) return '昨天';
    if (diff < 7) return `${diff}天前`;
    return d.toLocaleDateString('zh-CN');
  };

  const uniqueLocations = Array.from(new Set(jobs.filter(j => j.location).map(j => j.location)));
  const uniqueTypes = Array.from(new Set(jobs.filter(j => j.type).map(j => j.type)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="sm" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                职位列表
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/practice')}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                提升能力
              </button>
<ThemeToggle />

            </div>
          </div>
        </div>
      </nav>

      {/* 搜索和筛选栏 */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 关键词搜索 */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="搜索职位名称、企业..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
              />
            </div>
            
            {/* 地点筛选 */}
            {uniqueLocations.length > 0 && (
              <select
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
              >
                <option value="">所有地点</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            )}
            
            {/* 类型筛选 */}
            {uniqueTypes.length > 0 && (
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
              >
                <option value="">所有类型</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}
            
            {/* 清除筛选 */}
            {(searchKeyword || filterLocation || filterType) && (
              <button
                onClick={() => {
                  setSearchKeyword('');
                  setFilterLocation('');
                  setFilterType('');
                }}
                className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {error && <ErrorAlert message={error} />}

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            共 <span className="font-semibold text-gray-900 dark:text-white">{total}</span> 个职位
          </p>
        </div>

        {filteredJobs.length === 0 ? (
          <EmptyState title="暂无职位" description="暂时没有活跃的招聘职位" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* 渐变背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-50/0 via-brand-50/0 to-pink-50/0 group-hover:from-brand-50/50 group-hover:via-brand-50/30 group-hover:to-brand-50/50 dark:group-hover:from-brand-900/20 dark:group-hover:via-brand-900/10 dark:group-hover:to-brand-900/20 transition-all duration-500" />
                
                {/* 顶部：企业Logo + 标题区域 */}
                <div className="relative flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    {job.enterprise?.logo ? (
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white dark:bg-gray-700 shadow-md">
                        <img src={getImageUrl(job.enterprise.logo)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-100 dark:from-brand-900/40 dark:to-brand-900/40 flex items-center justify-center">
                        <BuildingOfficeIcon className="w-7 h-7 text-brand-500 dark:text-brand-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                      {job?.title || '未知职位'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.enterprise?.name || '未知企业'}</p>
                  </div>
                  {/* 箭头图标 */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
                      <ArrowRightIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* 标签区域 */}
                <div className="relative flex flex-wrap gap-2 mb-4">
                  {job.location && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                      <MapPinIcon className="w-3.5 h-3.5 mr-1.5" />
                      {job.location}
                    </span>
                  )}
                  {job.salaryRange && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-xs text-green-600 dark:text-green-400 font-medium">
                      <CurrencyDollarIcon className="w-3.5 h-3.5 mr-1.5" />
                      {job.salaryRange}
                    </span>
                  )}
                  {job.type && (
                    <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-xs text-brand-600 dark:text-brand-400 font-medium">
                      {job.type}
                    </span>
                  )}
                </div>

                {/* 底部信息 */}
                <div className="relative flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(job.createdAt)}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 font-semibold">
                      {job._count?.applications || 0}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">人已申请</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </main>
    </div>
  );
}
