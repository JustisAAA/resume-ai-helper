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

/* ── 核心功能 ── */
const features = [
  {
    iconBg: 'from-purple-500 to-violet-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: 'AI 智能简历筛选',
    desc: '上传简历批量解析，AI 自动评分并给出匹配度分析，初步筛选效率大幅提升',
  },
  {
    iconBg: 'from-pink-500 to-rose-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '一键发布职位',
    desc: '简洁的发布流程，支持添加办公环境图片，让职位展示更直观。',
  },
  {
    iconBg: 'from-indigo-500 to-brand-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '自动化面试评估',
    desc: 'AI 面试官自动进行初筛面试，结束后生成详细评估报告。',
  },
  {
    iconBg: 'from-blue-500 to-cyan-500',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: '数据驱动决策',
    desc: '招聘数据看板，随时查看招聘进度、渠道效果与候选人质量。',
  },
]

/* ── 企业痛点 ── */
const painPoints = [
  { icon: '⏰', title: '筛选效率低', desc: '简历数量多，人工逐一筛选耗时耗力，好候选人容易被遗漏' },
  { icon: '💰', title: '招聘成本高', desc: '招聘网站会员费用高，面试组织协调成本大，整体预算压力大' },
  { icon: '❓', title: '评估不标准', desc: '不同面试官评分标准不一，优秀候选人容易被错失' },
  { icon: '🔒', title: '沟通管理难', desc: '缺乏系统化的候选人沟通与状态管理工具，效率低下' },
]

/* ── 核心价值点（替代假数据） ── */
const values = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: '智能简历筛选',
    desc: '基于 AI 大模型的简历解析与评分，自动识别候选人能力匹配度，节省人工筛选时间',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: 'AI 模拟面试',
    desc: '根据岗位要求和候选人简历生成个性化面试题，自动评估回答质量并生成结构化报告',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'HR 协作管理',
    desc: '企业主账号可创建多个 HR 子账号，按岗位分配权限，实现团队化招聘协作',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: '数据安全可控',
    desc: '简历和面试数据加密存储，企业可自主管理数据访问权限，保障招聘信息安全',
  },
]

/* ── 主组件 ── */
export default function EnterpriseMarketing() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
                简历面试<span className="text-brand-600 dark:text-brand-400">AI</span>助手
                <span className="text-gray-400 dark:text-gray-500 text-sm font-normal ml-1">· 企业版</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/enterprise/login')}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-4 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-all duration-300"
              >
                登录
              </button>
              <button
                onClick={() => navigate('/enterprise/register')}
                className="text-sm bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white px-5 py-1.5 rounded-lg font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                免费注册
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pt-40 lg:pb-48">
        {/* 动态光斑背景 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
          <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-brand-300/20 dark:bg-brand-800/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-800/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-300/15 dark:bg-pink-800/15 rounded-full blur-[100px] animate-blob animation-delay-4000" />
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
            让 AI 帮您
            <br />
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-purple-500 bg-clip-text text-transparent">
              高效招聘顶尖人才
            </span>
          </h1>

          {/* 副标题 */}
          <p className={`text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-14 leading-relaxed ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            智能简历筛选、职位快捷发布、自动化面试评估、数据驱动决策——四大核心能力，
            <br className="hidden sm:inline" />
            助您<span className="font-semibold text-gray-800 dark:text-gray-100">提升招聘效率</span>，快速找到最匹配的候选人。
          </p>

          {/* CTA 按钮 */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            <button
              onClick={() => navigate('/enterprise/register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-1 transition-all duration-300 text-base"
            >
              免费开始使用 →
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

      {/* ===== 企业痛点 ===== */}
      <section className="bg-gray-50 dark:bg-gray-800/30 py-24 sm:py-32" id="painpoints">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold mb-4">
              企业痛点
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              企业招聘的难题，我们帮您解决
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              企业招聘常面临以下难题，AI 可以有效缓解
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((p, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.2 + i * 0.1}s`, opacity: 0 }}
              >
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{p.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 核心功能 ===== */}
      <section className="py-24 sm:py-32 dark:bg-gray-900" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-sm font-semibold mb-4">
              核心能力
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              四大核心能力，重构招聘流程
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">从简历筛选到面试评估，AI 做您的智能招聘助手</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-transparent transition-all duration-500 overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${0.2 + i * 0.15}s`, opacity: 0 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.iconBg} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.06] transition-opacity duration-500 rounded-2xl`} />
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.iconBg} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 核心价值 ===== */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-500" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              为什么选择我们？
            </h2>
            <p className="text-brand-100 text-lg">四大核心能力，重构企业招聘体验</p>
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

      {/* ===== CTA ===== */}
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
            准备好，用 AI 升级您的招聘流程了吗？
          </h2>
          <p className={`text-gray-500 dark:text-gray-400 text-lg mb-10 max-w-2xl mx-auto ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.45s' }}
          >
            免费注册企业账号，立即体验 AI 驱动的招聘管理平台。
          </p>
          <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => navigate('/enterprise/register')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-1 transition-all duration-300 text-base"
            >
              免费注册，开始使用 →
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
            <span className="font-bold text-white text-lg">简历面试AI助手 · 企业版</span>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm">
            © 2026 简历面试AI助手 · 山东省大学生软件设计大赛参赛作品
          </div>
        </div>
      </footer>
    </div>
  )
}
