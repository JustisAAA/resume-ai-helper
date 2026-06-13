import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrAPI } from '../services/hrAPI';
import { getImageUrl } from '../utils/image';
import ThemeToggle from '../components/ThemeToggle';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';

/* ── 图标组件 ── */

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
)

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3 3 0 00-3-3H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const ChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
)

const InterviewIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
)

const TeamIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
)

/* ── 卡片配色映射 ── */
const CARD_STYLE: Record<string, {
  gradientBar: string
  hoverCircleBg: string
  iconGradient: string
  shadow: string
  hoverTitle: string
  hoverTextColor: string
}> = {
  'applications': {
    gradientBar: 'from-brand-400 via-brand-500 to-brand-500',
    hoverCircleBg: 'bg-brand-50 dark:bg-brand-900/20',
    iconGradient: 'from-brand-500 to-brand-500',
    shadow: 'shadow-brand-500/25',
    hoverTitle: 'group-hover:text-brand-600 dark:group-hover:text-brand-400',
    hoverTextColor: 'text-brand-600 dark:text-brand-400',
  },
  'messages': {
    gradientBar: 'from-brand-400 via-brand-500 to-green-500',
    hoverCircleBg: 'bg-brand-50 dark:bg-brand-900/20',
    iconGradient: 'from-brand-500 to-green-500',
    shadow: 'shadow-brand-500/25',
    hoverTitle: 'group-hover:text-brand-600 dark:group-hover:text-brand-400',
    hoverTextColor: 'text-brand-600 dark:text-brand-400',
  },
  'interviews': {
    gradientBar: 'from-cyan-400 via-cyan-500 to-brand-500',
    hoverCircleBg: 'bg-cyan-50 dark:bg-cyan-900/20',
    iconGradient: 'from-cyan-500 to-brand-500',
    shadow: 'shadow-cyan-500/25',
    hoverTitle: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    hoverTextColor: 'text-cyan-600 dark:text-cyan-400',
  },
  'hr-management': {
    gradientBar: 'from-violet-400 via-purple-500 to-fuchsia-500',
    hoverCircleBg: 'bg-violet-50 dark:bg-violet-900/20',
    iconGradient: 'from-brand-500 to-brand-600',
    shadow: 'shadow-brand-500/25',
    hoverTitle: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
    hoverTextColor: 'text-violet-600 dark:text-violet-400',
  },
}

export default function HRDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hrAPI.getDashboard().then(r => { setData(r.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hrToken');
    localStorage.removeItem('hrUser');
    navigate('/hr/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="sm" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
        <ErrorAlert message="加载失败" onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  const isHR = data.userRole === 'HR';

  const FEATURE_CARDS = isHR ? [
    { key: 'applications', title: '简历筛选', desc: `查看和处理候选人申请 · ${data.job.pendingCount} 份待处理`, path: '/hr/applications', icon: DocumentIcon },
    { key: 'messages', title: '消息', desc: '与求职者在线沟通', path: '/hr/messages', icon: ChatIcon },
    { key: 'interviews', title: '面试管理', desc: '对候选人发起AI面试和查看报告', path: '/hr/interviews', icon: InterviewIcon },
  ] : [
    { key: 'messages', title: '消息', desc: '与HR子账号内部沟通', path: '/hr/messages', icon: ChatIcon },
    { key: 'hr-management', title: 'HR管理', desc: '管理HR子账号', path: '/enterprise/hr-management', icon: TeamIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 顶部导航 */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-500 flex items-center justify-center shadow-sm">
              <BuildingIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">HR 工作台</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => navigate('/hr/settings')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              设置
            </button>
            <button onClick={handleLogout} className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              退出
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="relative">
        {/* 背景装饰 */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-brand-200/20 dark:bg-brand-900/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-brand-200/15 dark:bg-brand-900/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 欢迎区 */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isHR ? `${data.hrName || 'HR'}，你好 👋` : '你好 👋'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base mt-1">
              {isHR ? `负责岗位：${data.job.title}` : '管理企业HR团队'}
            </p>
          </div>

          {/* 企业信息卡片（只读） */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm p-8 mb-6 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brand-100/40 dark:from-brand-900/20 to-transparent rounded-full -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-brand-100/30 dark:from-brand-900/15 to-transparent rounded-full -ml-6 -mb-6 pointer-events-none" />
            <div className="flex items-center gap-6 relative">
              {/* Logo（只读，无编辑按钮） */}
              <div className="relative flex-shrink-0">
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden ring-4 ring-white dark:ring-gray-900">
                  {data.enterprise.logo ? (
                    <img src={getImageUrl(data.enterprise.logo)} alt="" className="w-24 h-24 rounded-2xl object-cover" />
                  ) : (
                    <BuildingIcon className="w-10 h-10 text-white/80" />
                  )}
                </div>
                {/* 无相机编辑按钮 — HR不能修改企业信息 */}
              </div>
              {/* 企业信息 */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{data.enterprise.name || '未设置企业名称'}</h2>
                {data.enterprise.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{data.enterprise.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {data.enterprise.industry && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-full">
                      {data.enterprise.industry}
                    </span>
                  )}
                  {data.enterprise.size && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-full">
                      {data.enterprise.size}
                    </span>
                  )}
                  {data.enterprise.location && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-full">
                      {data.enterprise.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 岗位统计（仅普通HR显示） */}
          {isHR && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:border-brand-100 dark:hover:border-brand-800 transition-all duration-300 text-left w-full overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-t-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">总申请</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.job.applicationCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 group-hover:scale-110 transition-all duration-200">
                    <DocumentIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>
                </div>
              </div>
              <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:border-brand-100 dark:hover:border-brand-800 transition-all duration-300 text-left w-full overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-t-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">已通过</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.job.acceptedCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 group-hover:scale-110 transition-all duration-200">
                    <InterviewIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>
                </div>
              </div>
              <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:border-amber-100 dark:hover:border-amber-800 transition-all duration-300 text-left w-full overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-t-2xl" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">待筛选</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.job.pendingCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 group-hover:scale-110 transition-all duration-200">
                    <DocumentIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 功能卡片 - 2列网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURE_CARDS.map((card) => {
              const s = CARD_STYLE[card.key];
              const Icon = card.icon;
              return (
                <button
                  key={card.key}
                  onClick={() => navigate(card.path)}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full overflow-hidden border border-gray-100 dark:border-gray-800"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.gradientBar}`} />
                  <div className={`absolute -right-4 -top-4 w-20 h-20 ${s.hoverCircleBg} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.iconGradient} flex items-center justify-center mb-4 shadow-lg ${s.shadow} group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-1 ${s.hoverTitle}`}>
                      {card.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                      {card.desc}
                    </p>
                    <div className={`flex items-center gap-1.5 ${s.hoverTextColor} font-medium text-sm group-hover:gap-2.5 transition-all duration-200`}>
                      <span>进入</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
