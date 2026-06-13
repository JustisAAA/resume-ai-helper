import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { enterpriseAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Loading from '../components/Loading'
import ErrorAlert from '../components/ErrorAlert'

const CHART_COLORS = ['#818cf8', '#a78bfa', '#c4b5fd', '#e0e7ff']

export default function EnterpriseAnalytics() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) { navigate('/enterprise/login'); return }
      const res = await enterpriseAPI.getDashboardStats()
      setStats(res)
    } catch (err: any) {
      setError(err.response?.data?.error || '加载失败')
    } finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="sm" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ErrorAlert message={error} onRetry={loadData} />
      </div>
    )
  }

  const summaryCards = stats ? [
    { label: '职位总数', value: Math.floor(stats.funnel.jobs) },
    { label: '总申请', value: Math.floor(stats.funnel.applications) },
    { label: '面试数', value: Math.floor(stats.funnel.interviews) },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/enterprise/dashboard')} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <span className="font-bold text-gray-900 dark:text-white text-lg">数据分析</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 概览卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          ))}
        </div>

        {stats && (
          <div className="space-y-6">
            {/* 招聘漏斗 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">招聘漏斗</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[
                  { name: '职位', value: Math.floor(stats.funnel.jobs) },
                  { name: '申请', value: Math.floor(stats.funnel.applications) },
                  { name: '面试', value: Math.floor(stats.funnel.interviews) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {CHART_COLORS.map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 申请趋势 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">申请趋势（最近7天）</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats.applicationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 职位热度 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">职位热度排行</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.jobPopularity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="jobTitle" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="applications" radius={[8, 8, 0, 0]} fill="#818cf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
