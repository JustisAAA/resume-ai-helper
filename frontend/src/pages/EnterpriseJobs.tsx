import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobAPI, enterpriseAPI } from '../services/api'
import { useToast } from '../components/Toast'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import ErrorAlert from '../components/ErrorAlert'
import StatusBadge from '../components/StatusBadge'
import { PencilIcon, TrashIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'

export default function EnterpriseJobs() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/enterprise/login')
        return
      }

      // 先获取企业信息，再查询该企业职位
      const enterpriseRes = await enterpriseAPI.getProfile(token)
      const res = await jobAPI.list({ enterpriseId: enterpriseRes.enterprise.id })
      setJobs(res.jobs || [])
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      const msg = errObj.response?.data?.error || '加载失败';
      setError(msg);
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个职位吗？')) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      await jobAPI.delete(token, id)
      showToast('删除成功', 'success')
      loadJobs()
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      const msg = errObj.response?.data?.error || '删除失败';
      showToast(msg, 'error')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      await jobAPI.updateStatus(token, id, newStatus as any)
      showToast('状态更新成功', 'success')
      loadJobs()
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      const msg = errObj.response?.data?.error || '更新失败';
      showToast(msg, 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="sm" />
      </div>
    )
  }

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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">职位管理</span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate('/enterprise/jobs/new')}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
              >
                发布新职位
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && <ErrorAlert message={error} />}

        {jobs.length === 0 ? (
          <EmptyState title="暂无职位" description="还没有发布任何职位" action={{ label: '发布职位', onClick: () => navigate('/enterprise/jobs/new') }} />
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {jobs.map((job) => (
                <li key={job.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <p className="text-sm font-medium text-brand-600 dark:text-brand-400 truncate">
                            {job?.title || '未知职位'}
                          </p>
                          <StatusBadge status={job.status} type="job" />
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                          {job.location && (
                            <span className="flex items-center">
                              <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16A6 6 0 016.058 7.293 6 6 0 0017.657 16z" />
                              </svg>
                              {job.location}
                            </span>
                          )}
                          {job.type && (
                            <span>{job.type}</span>
                          )}
                          {job.salaryRange && (
                            <span>{job.salaryRange}</span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          申请数：{job._count?.applications || 0}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.id, e.target.value)}
                          className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        >
                          <option value="ACTIVE">活跃</option>
                          <option value="CLOSED">关闭</option>
                          <option value="DRAFT">草稿</option>
                        </select>
                        <button
                          onClick={() => navigate(`/enterprise/jobs/${job.id}/edit`)}
                          className="inline-flex items-center text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="inline-flex items-center text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          删除
                        </button>
                        {job.hrAccount?.userId && (
                          <button
                            onClick={() => navigate(`/enterprise/messages/${job.hrAccount.userId}?name=${encodeURIComponent(job.hrAccount.name||'')}`)}
                            className="inline-flex items-center text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                            title="联系HR"
                          >
                            <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-1" />
                            联系HR
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
