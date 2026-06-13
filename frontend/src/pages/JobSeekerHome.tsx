import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

/* ── 动画样式 ── */
const floatingAnimation = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob { animation: blob 8s infinite ease-in-out; }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.7s ease-out forwards; opacity: 0; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-float { animation: float 4s ease-in-out infinite; }

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-in { animation: scaleIn 0.5s ease-out forwards; opacity: 0; }
`

/* ── 九大功能 ── */
const features = [
  {
    iconBg: 'from-brand-500 to-cyan-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'AI 智能简历分析',
    desc: '大模型自动解析简历，精准匹配岗位需求，生成能力画像和多维度评分报告。',
    path: '/resumes',
    cta: '上传简历',
  },
  {
    iconBg: 'from-violet-500 to-purple-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '模拟面试实时评估',
    desc: 'AI 面试官一对一模拟，实时语音/文字互动，面试结束即出详细评估报告。',
    path: '/interviews',
    cta: '开始面试',
  },
  {
    iconBg: 'from-emerald-500 to-teal-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: '求职全流程指导',
    desc: '从简历优化到 Offer 选择，AI 全程陪伴，让求职不再迷茫。',
    path: '/tools/guide',
    cta: '获取攻略',
  },
  {
    iconBg: 'from-orange-500 to-rose-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
    title: 'AI 简历优化',
    desc: 'AI 深度分析简历短板，智能改写表达，提升简历竞争力。',
    path: '/tools/optimize',
    cta: '开始优化',
  },
  {
    iconBg: 'from-blue-500 to-indigo-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 3.75h9.75M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
      </svg>
    ),
    title: 'AI 简历评分',
    desc: '多维度深度评分，精准诊断简历短板，给出可执行的改进建议。',
    path: '/tools/score',
    cta: '开始评分',
  },
  {
    iconBg: 'from-cyan-500 to-blue-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: '人岗匹配分析',
    desc: 'AI 分析简历与目标岗位的匹配度，精准定位能力差距。',
    path: '/tools/match',
    cta: '开始匹配',
  },
  {
    iconBg: 'from-amber-500 to-orange-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
    title: '面试问题生成',
    desc: 'AI 根据岗位和简历生成高频面试问题，附标准答案要点。',
    path: '/tools/questions',
    cta: '查看问题',
  },
  {
    iconBg: 'from-pink-500 to-rose-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 7.5v6.75m0 0l-3-3m3 3l3-3" />
      </svg>
    ),
    title: '简历模板生成',
    desc: '5 款专业模板，一键生成精美简历，ATS 友好，HR 一眼相中。',
    path: '/templates',
    cta: '查看模板',
  },
  {
    iconBg: 'from-teal-500 to-emerald-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: '面试报告中心',
    desc: '回顾所有面试表现，查看多维度评估报告和评分趋势。',
    path: '/reports',
    cta: '查看报告',
  },
]

/* ── 核心价值（替代假数据） ── */
const values = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'AI 大模型驱动',
    desc: '基于先进大语言模型，深度理解简历内容与面试场景',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: '求职全流程覆盖',
    desc: '九大核心功能，从简历到 Offer 一站式解决',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: '数据安全私密',
    desc: '简历数据本地加密存储，面试过程全程私密',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: '专为大学生设计',
    desc: '深度理解大学生求职场景，更懂你的需求和痛点',
  },
]

/* ── 主组件 ── */
export default function JobSeekerHome() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)

  useEffect(() => {
    setMounted(true)
    try {
      const str = localStorage.getItem('user')
      if (str) setUser(JSON.parse(str))
    } catch {}
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <style>{floatingAnimation}</style>

      {/* ===== 顶部导航 ===== */}
      <nav className="relative z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-800/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30 animate-pulse" />
                <svg className="relative z-10 w-5 h-5 text-white m-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
                简历面试<span className="text-brand-600 dark:text-brand-400">AI</span>助手
              </span>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{user.name || user.email}</span>
                  <button onClick={handleLogout} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-all duration-300">
                    退出
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-4 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-all duration-300">
                    登录
                  </button>
                  <button onClick={() => navigate('/register')} className="text-sm bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white px-5 py-1.5 rounded-lg font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300">
                    免费注册
                  </button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Hero 区域 ===== */}
      <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pt-40 lg:pb-48">
        {/* 动态光斑背景 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
          <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-brand-300/20 dark:bg-brand-800/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-800/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-300/15 dark:bg-cyan-800/15 rounded-full blur-[100px] animate-blob animation-delay-4000" />
          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 标签 */}
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-sm font-semibold mb-8 border border-brand-200/50 dark:border-brand-700/50 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            AI 驱动 · 山东省大学生软件设计大赛参赛作品
          </div>

          {/* 主标题 */}
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.05] tracking-tight ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.25s' }}
          >
            用 AI 重新定义
            <br />
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 bg-clip-text text-transparent">
              你的求职之路
            </span>
          </h1>

          {/* 副标题 */}
          <p className={`text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-14 leading-relaxed ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            从简历分析到模拟面试，从智能评分到求职攻略——
            <br className="hidden sm:inline" />
            <span className="font-semibold text-gray-800 dark:text-gray-100">九大 AI 核心功能</span>，助你高效拿下心仪 Offer
          </p>

          {/* CTA 按钮 */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            <button
              onClick={() => navigate(user ? '/interviews' : '/register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-1 transition-all duration-300 text-base"
            >
              {user ? '开始模拟面试' : '免费开始使用'} →
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-all duration-300 text-base"
            >
              了解更多 ↓
            </button>
          </div>

          {/* 信任标识 */}
          <div className={`flex flex-wrap items-center justify-center gap-6 mt-14 text-sm text-gray-400 dark:text-gray-500 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.9s' }}
          >
            {['无需下载', '免费使用', '数据安全', 'AI 驱动'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 核心价值 ===== */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              为什么选择我们？
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.2 + i * 0.15}s`, opacity: 0 }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white mb-4">
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                <p className="text-brand-100 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 九大功能 ===== */}
      <section className="py-24 sm:py-32 bg-white dark:bg-gray-800/50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-sm font-semibold mb-4">
              核心功能
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              九大核心能力，覆盖求职全流程
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">从简历制作到面试通过，AI 做你的私人求职教练</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                onClick={() => navigate(user ? f.path : '/register')}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-transparent transition-all duration-500 overflow-hidden cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${0.2 + i * 0.1}s`, opacity: 0 }}
              >
                {/* 悬停渐变背景 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.iconBg} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.06] transition-opacity duration-500 rounded-2xl`} />

                {/* 右上角序号 */}
                <div className="absolute top-5 right-5 text-4xl font-black text-gray-100 dark:text-gray-700/50 group-hover:text-brand-100 dark:group-hover:text-brand-900/30 transition-colors duration-500 select-none">
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className="relative">
                  {/* 图标 */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.iconBg} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                    {f.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {f.desc}
                  </p>

                  {/* CTA */}
                  <div className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                    {user ? f.cta : '免费试用'}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 求职流程 ===== */}
      <section className="py-24 sm:py-32 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-sm font-semibold mb-4">
              使用流程
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              三步走，AI 陪你拿到 Offer
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">把复杂的求职过程，拆解成清晰可执行的阶段</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                phase: '第一阶段',
                title: '简历准备',
                desc: '先搞清楚自己现在的水平，再针对性提升',
                steps: [
                  { num: '01', title: '上传简历', desc: '支持 PDF/Word，AI 自动解析' },
                  { num: '02', title: '简历评分', desc: '多维度诊断短板' },
                  { num: '03', title: '简历优化', desc: 'AI 深度改写提升' },
                ],
                color: 'from-blue-500 to-brand-500',
                bgLight: 'bg-blue-50 dark:bg-blue-900/20',
                textColor: 'text-blue-600 dark:text-blue-400',
                borderColor: 'border-blue-100 dark:border-blue-800',
              },
              {
                phase: '第二阶段',
                title: '面试提升',
                desc: '知己知彼，针对性备战每一个面试环节',
                steps: [
                  { num: '04', title: '人岗匹配', desc: '分析简历与岗位差距' },
                  { num: '05', title: '面试问题', desc: '生成高频问题清单' },
                  { num: '06', title: '模拟面试', desc: 'AI 实时对话评估' },
                ],
                color: 'from-brand-500 to-purple-500',
                bgLight: 'bg-brand-50 dark:bg-brand-900/20',
                textColor: 'text-brand-600 dark:text-brand-400',
                borderColor: 'border-brand-100 dark:border-brand-800',
              },
              {
                phase: '第三阶段',
                title: '求职通关',
                desc: '系统复盘，持续迭代，直到拿到满意 Offer',
                steps: [
                  { num: '07', title: '求职攻略', desc: '全阶段实用建议' },
                  { num: '08', title: '查看报告', desc: '多维度评估复盘' },
                  { num: '09', title: '简历模板', desc: '一键生成精美简历' },
                ],
                color: 'from-purple-500 to-pink-500',
                bgLight: 'bg-purple-50 dark:bg-purple-900/20',
                textColor: 'text-purple-600 dark:text-purple-400',
                borderColor: 'border-purple-100 dark:border-purple-800',
              },
            ].map((phase, pi) => (
              <div key={pi} className="group relative">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                  {/* 阶段头部 */}
                  <div className={`relative px-6 py-5 ${phase.bgLight} border-b ${phase.borderColor}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                        {pi + 1}
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${phase.textColor} uppercase tracking-wider`}>{phase.phase}</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{phase.title}</div>
                      </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{phase.desc}</p>
                  </div>

                  {/* 步骤列表 */}
                  <div className="p-5 space-y-3">
                    {phase.steps.map((step, si) => (
                      <div
                        key={si}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300 cursor-pointer"
                        onClick={() => {
                          const paths = ['/resumes', '/tools/score', '/tools/optimize', '/tools/match', '/tools/questions', '/interviews', '/tools/guide', '/reports', '/templates']
                          navigate(user ? paths[si + pi * 3] : '/register')
                        }}
                      >
                        <div className={`w-8 h-8 rounded-lg ${phase.bgLight} flex items-center justify-center flex-shrink-0`}>
                          <span className={`text-xs font-bold ${phase.textColor}`}>{step.num}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{step.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 右侧箭头（桌面端） */}
                {pi < 2 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA 区域 ===== */}
      <section className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/25 mb-8 ${mounted ? 'animate-scale-in' : 'opacity-0'}`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.3s' }}
          >
            准备好，拿下心仪的 Offer 了吗？
          </h2>
          <p className={`text-gray-500 dark:text-gray-400 text-lg mb-10 max-w-2xl mx-auto ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.45s' }}
          >
            免费注册，立即体验 AI 驱动的求职辅助平台。
          </p>
          <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => navigate(user ? '/interviews' : '/register')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-1 transition-all duration-300 text-base"
            >
              {user ? '进入面试中心 →' : '免费注册，开始使用 →'}
            </button>
          </div>
        </div>
      </section>

      {/* ===== 底部 Footer ===== */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg">简历面试AI助手</span>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm">
            © 2026 简历面试AI助手 · 山东省大学生软件设计大赛参赛作品
          </div>
        </div>
      </footer>
    </div>
  )
}
