import { useEffect, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../utils/image'
import { BoltIcon, BuildingOfficeIcon, ClipboardDocumentListIcon, ChatBubbleLeftRightIcon, PlayCircleIcon } from '@heroicons/react/24/outline'

export default function Dashboard() {
  const navigate = useNavigate()
const [user, setUser] = useState<{ name?: string; email?: string; avatar?: string } | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) { navigate('/login'); return }
    try {
      const parsed = JSON.parse(userStr)
      setUser(parsed)
      if (parsed?.role === 'ADMIN') { navigate('/admin'); return }
      if (parsed?.role === 'ENTERPRISE') { navigate('/enterprise/dashboard'); return }
    } catch {
      localStorage.removeItem('user')
      navigate('/login')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-sm">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">简历面试AI助手</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{user?.name || user?.email}</span>
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-100 to-brand-100 dark:from-brand-900/30 dark:to-brand-900/30 flex items-center justify-center text-sm font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50 hover:shadow-md transition-all cursor-pointer overflow-hidden"
            >
              {user?.avatar ? (
                <img src={getImageUrl(user.avatar)} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                (user?.name || user?.email || '?')[0].toUpperCase()
              )}
            </button>
<ThemeToggle />

            <button onClick={handleLogout} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              退出
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="relative flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-200/20 dark:bg-brand-900/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center w-full">
          {/* 欢迎语 */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            你好，{user?.name || '同学'} 👋
          </h1>
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10">
            提升能力 or 直接求职，你选一个
          </p>

          {/* 双入口 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* 提升能力 */}
            <button
              onClick={() => navigate('/practice')}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-700 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-brand-500/25">
                  <BoltIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">提升能力</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">AI模拟面试，提升求职竞争力</p>
              </div>
            </button>

            {/* 求职广场 */}
            <button
              onClick={() => navigate('/jobs')}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-brand-500/25">
                  <BuildingOfficeIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">求职广场</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">浏览企业职位，找到心仪工作</p>
              </div>
            </button>
          </div>

          {/* 快捷入口 */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => navigate('/my-applications')}
              className="group flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-md transition-all duration-200"
            >
              <ClipboardDocumentListIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">我的申请</span>
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="group flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-md transition-all duration-200"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">我的消息</span>
            </button>
            <button
              onClick={() => navigate('/enterprise-interviews')}
              className="group flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-700 hover:shadow-md transition-all duration-200"
            >
              <PlayCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">企业面试</span>
            </button>
          </div>

          {/* 底部说明 */}
          <p className="mt-12 text-gray-400 dark:text-gray-400 text-sm">
            AI 驱动的求职全流程助手 · 山东省大学生软件设计大赛参赛作品
          </p>
        </div>
      </div>
    </div>
  )
}
