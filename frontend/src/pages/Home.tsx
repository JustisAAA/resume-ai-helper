import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

/* ── 渐变动态背景组件 ── */
function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 主渐变底色 */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />

      {/* 动态光斑 1 */}
      <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-brand-300/20 dark:bg-brand-800/20 rounded-full blur-[120px] animate-blob" />
      {/* 动态光斑 2 */}
      <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-800/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      {/* 动态光斑 3 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-300/15 dark:bg-cyan-800/15 rounded-full blur-[100px] animate-blob animation-delay-4000" />

      {/* 网格背景纹理 */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
    </div>
  )
}

/* ── 悬浮动画样式 (通过 className 注入) ── */
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
.animate-fade-in-up { animation: fadeInUp 0.7s ease-out forwards; }

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-in { animation: scaleIn 0.5s ease-out forwards; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer-text {
  background: linear-gradient(90deg, #000 0%, #6366f1 20%, #a855f7 40%, #ec4899 60%, #000 80%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}
.dark .shimmer-text {
  background: linear-gradient(90deg, #fff 0%, #818cf8 20%, #c084fc 40%, #f472b6 60%, #fff 80%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-float { animation: float 4s ease-in-out infinite; }
`

/* ── 核心价值点（替代假数据） ── */
const values = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: 'AI 大模型驱动',
    desc: '基于大语言模型，深度理解简历内容与面试场景，提供精准分析与建议',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: '求职全流程覆盖',
    desc: '从简历分析、评分，到模拟面试、求职攻略、简历模板，覆盖求职各阶段',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'AI 全程陪伴',
    desc: '注册登录后即可使用，从简历分析到面试复盘，AI 持续提供建议',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: '数据安全私密',
    desc: '简历数据本地加密存储，面试过程全程私密，不外泄个人信息',
  },
]

/* ── 主组件 ── */
export default function Home() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* 注入动画样式 */}
      <style>{floatingAnimation}</style>

      {/* ===== 顶部导航 ===== */}
      <nav className="relative z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-800/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              {/* Logo 图标 */}
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
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-4 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-all duration-300"
              >
                登录
              </button>
              <button
                onClick={() => navigate('/register')}
                className="text-sm bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white px-5 py-1.5 rounded-lg font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                免费注册
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Hero 区域 ===== */}
      <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pt-40 lg:pb-48">
        <HeroBg />

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
            <span className="relative">
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 bg-clip-text text-transparent">
                求职与招聘
              </span>
              {/* 标题下方装饰线 */}
              <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-2" viewBox="0 0 120 8">
                <path d="M0 4 Q30 0 60 4 Q90 8 120 4" stroke="url(#grad)" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-pulse" />
                <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4f46e5" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
              </svg>
            </span>
          </h1>

          {/* 副标题 */}
          <p className={`text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-14 leading-relaxed ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            从简历分析到模拟面试，从智能招聘到数据决策——
            <br className="hidden sm:inline" />
            <span className="font-semibold text-gray-800 dark:text-gray-100">一站式 AI 求职辅助平台</span>，助你高效拿下心仪 Offer
          </p>

          {/* 角色选择卡片 */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            {/* 求职者卡片 */}
            <RoleCard
              onClick={() => navigate('/home')}
              gradientFrom="from-brand-500"
              gradientTo="to-cyan-500"
              iconBg="from-brand-600 to-brand-500"
              icon={
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              }
              title="我是求职者"
              subtitle="上传简历 · AI 评分 · 模拟面试 · 求职攻略"
              features={['AI 简历评分', '模拟面试', '人岗匹配分析', '求职攻略']}
              cta="开始使用 →"
              accentColor="brand"
            />

            {/* 企业卡片 */}
            <RoleCard
              onClick={() => navigate('/enterprise/marketing')}
              gradientFrom="from-violet-500"
              gradientTo="to-purple-500"
              iconBg="from-violet-600 to-purple-500"
              icon={
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              }
              title="我是企业 / HR"
              subtitle="发布职位 · 简历筛选 · AI 面试 · 数据分析"
              features={['AI 简历筛选', '一键发布职位', '自动化面试评估']}
              cta="了解详情 →"
              accentColor="violet"
            />
          </div>

          {/* 信任标识 */}
          <div className={`flex flex-wrap items-center justify-center gap-6 mt-14 text-sm text-gray-400 dark:text-gray-500 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.9s' }}
          >
            {['即开即用', '免费使用', '数据安全', 'AI 驱动'].map((t, i) => (
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
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              为什么选择我们？
            </h2>
            <p className="text-brand-100 text-base max-w-xl mx-auto">
              不堆砌数字，只用真实的产品能力说话
            </p>
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

      {/* ===== 底部 Footer ===== */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
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

/* ── 角色选择卡片组件 ── */
function RoleCard({
  onClick, gradientFrom, gradientTo, iconBg, icon, title, subtitle, features, cta, accentColor,
}: {
  onClick: () => void
  gradientFrom: string
  gradientTo: string
  iconBg: string
  icon: React.ReactNode
  title: string
  subtitle: string
  features: string[]
  cta: string
  accentColor: 'brand' | 'violet'
}) {
  const isBrand = accentColor === 'brand'
  const textColor = isBrand ? 'text-brand-600 dark:text-brand-400' : 'text-violet-600 dark:text-violet-400'
  const borderHover = isBrand ? 'hover:border-brand-300 dark:hover:border-brand-600' : 'hover:border-violet-300 dark:hover:border-violet-600'
  const shadowHover = isBrand ? 'hover:shadow-brand-500/20' : 'hover:shadow-violet-500/20'

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-10 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl hover:-translate-y-2 ${borderHover} ${shadowHover} transition-all duration-500 cursor-pointer overflow-hidden`}
    >
      {/* 悬停渐变背景 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500`} />

      {/* 左上装饰圆 */}
      <div className={`absolute -top-6 -left-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500`} />

      <div className="relative">
        {/* 图标 */}
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${iconBg} flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
          {icon}
        </div>

        {/* 标题 */}
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* 副标题 */}
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 font-medium">
          {subtitle}
        </p>

      <div className="space-y-3 mb-10 text-left">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${
                accentColor === 'brand'
                  ? 'bg-brand-100 dark:bg-brand-900/40'
                  : 'bg-violet-100 dark:bg-violet-900/40'
              }`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <svg className={`w-3.5 h-3.5 ${
                  accentColor === 'brand' ? 'text-brand-600 dark:text-brand-400' : 'text-violet-600 dark:text-violet-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`inline-flex items-center gap-2 ${textColor} font-bold group-hover:gap-3 transition-all duration-300`}>
          {cta.replace(' →', '')}
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </div>
  )
}
