import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

interface User {
  name?: string
  email?: string
}

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const { dark, toggleTheme } = useTheme()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try { 
        setUser(JSON.parse(userStr)) 
        navigate('/dashboard')
      } catch(e) { localStorage.removeItem('user') }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      title: '上传简历',
      desc: 'AI 智能分析简历内容，给出优化建议和评分',
      action: '开始上传',
      path: '/resumes',
      color: 'indigo',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: '开始面试',
      desc: '基于简历生成个性化面试题，AI 实时评估表现',
      action: '开始面试',
      path: '/interviews',
      color: 'purple',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: '查看报告',
      desc: '回顾面试表现，查看多维度评估报告和评分',
      action: '查看报告',
      path: '/reports',
      color: 'emerald',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      title: '简历评分',
      desc: 'AI 多维度评分，诊断简历短板，给出改进建议',
      action: '开始评分',
      path: '/tools/score',
      color: 'amber',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: '求职攻略',
      desc: 'AI 提供求职全阶段实用建议和工具',
      action: '获取攻略',
      path: '/tools/guide',
      color: 'teal',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      title: '简历模板',
      desc: '5 款专业模板，一键生成精美简历',
      action: '查看模板',
      path: '/templates',
      color: 'violet',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.228-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: '人岗匹配',
      desc: 'AI 分析简历与目标岗位的匹配度，精准定位差距',
      action: '开始匹配',
      path: '/tools/match',
      color: 'rose',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: '简历优化',
      desc: 'AI 深度优化简历表达，提升关键词覆盖和可读性',
      action: '开始优化',
      path: '/tools/optimize',
      color: 'cyan',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.45-.086.908-.177 1.372-.274l1.118-1.118a1.274 1.274 0 011.8 0l1.118 1.118c.464.097.922.188 1.372.274m-7.072 0A37.97 37.97 0 0112 6c1.02 0 2.026.048 3.012.14m-7.072 0A37.97 37.97 0 0021 12c0 1.02-.05 2.025-.146 3.012m7.072-7.072A37.97 37.97 0 0012 18c-1.02 0-2.025-.05-3.012-.146m7.072-7.072A37.97 37.97 0 0012 6v12m0 0a9 9 0 110-18 9 9 0 010 18z" />
        </svg>
      ),
      title: '面试问题',
      desc: 'AI 根据岗位生成高频面试问题，附标准答案要点',
      action: '查看问题',
      path: '/tools/questions',
      color: 'lime',
    },
  ]

  const colorMap: Record<string, { solidBg: string; text: string; actionText: string }> = {
    indigo: { solidBg: 'bg-indigo-500', text: 'text-indigo-600', actionText: 'text-indigo-600' },
    purple: { solidBg: 'bg-purple-500', text: 'text-purple-600', actionText: 'text-purple-600' },
    emerald: { solidBg: 'bg-emerald-500', text: 'text-emerald-600', actionText: 'text-emerald-600' },
    amber: { solidBg: 'bg-amber-500', text: 'text-amber-600', actionText: 'text-amber-600' },
    teal: { solidBg: 'bg-teal-500', text: 'text-teal-600', actionText: 'text-teal-600' },
    violet: { solidBg: 'bg-violet-500', text: 'text-violet-600', actionText: 'text-violet-600' },
    rose: { solidBg: 'bg-rose-500', text: 'text-rose-600', actionText: 'text-rose-600' },
    cyan: { solidBg: 'bg-cyan-500', text: 'text-cyan-600', actionText: 'text-cyan-600' },
    lime: { solidBg: 'bg-lime-500', text: 'text-lime-600', actionText: 'text-lime-600' },
  }

  const painPoints = [
    { icon: '📄', title: '简历石沉大海', desc: '投出几十份简历，回复寥寥无几，不知道问题出在哪里' },
    { icon: '😰', title: '面试紧张卡壳', desc: '一到面试就紧张，准备好的答案全忘，表现大打折扣' },
    { icon: '❓', title: '不知如何准备', desc: '网上面经千千万，不知道哪些适合自己，复习没有方向' },
    { icon: '🎯', title: '不懂岗位匹配', desc: '不清楚自己的简历和JD的差距，不知道该重点突出什么' },
    { icon: '⏰', title: '准备时间不够', desc: '临近面试才匆忙准备，没有系统性的提升方案' },
    { icon: '📊', title: '缺乏反馈指导', desc: '练习面试没人点评，不知道自己的回答好不好，错在哪里' },
  ]

  const advantages = [
    { icon: '🤖', title: 'AI 深度驱动', desc: '基于大语言模型的智能分析，比传统规则引擎更懂简历和面试' },
    { icon: '🎯', title: '个性化定制', desc: '基于你的简历内容生成面试题，不是千篇一律的通用题库' },
    { icon: '📈', title: '多维度评估', desc: '从语言表达、逻辑思维、专业深度等5个维度全面评估面试表现' },
    { icon: '🔒', title: '数据安全保障', desc: '简历数据本地加密存储，不对外分享，面试过程全程私密' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* ===== 导航栏 ===== */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg">简历面试AI助手</span>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{user.name || user.email}</span>
                  <button onClick={handleLogout} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">退出登录</button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">登录</button>
                  <button onClick={() => navigate('/register')} className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">注册</button>
                </>
              )}
              <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title={dark ? '切换到浅色模式' : '切换到深色模式'}>
                {dark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Hero 区域 ===== */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8 border border-indigo-100 dark:border-indigo-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            AI 驱动的求职全流程助手 · 山东省大学生软件设计大赛参赛作品
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
            从简历到 Offer
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI 全程护航
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            智能简历分析、AI 简历评分、模拟面试、求职攻略、简历模板、AI 人岗匹配、简历优化、面试问题——九大核心功能，
            <br className="hidden sm:inline" />
            助你精准定位短板，全面提升求职竞争力，拿下心仪 Offer。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(user ? '/interviews' : '/register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 text-base"
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
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-gray-400 dark:text-gray-500">
            <span>✓ 无需下载</span>
            <span>✓ 免费使用</span>
            <span>✓ 数据安全</span>
          </div>
        </div>
      </section>

      {/* ===== 痛点分析 ===== */}
      <section className="bg-gray-50 dark:bg-gray-800/30 py-20 sm:py-24" id="painpoints">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              求职路上的那些「坑」，你踩过几个？
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              数据显示，83%的应届生在求职过程中遇到过以下问题。你不是一个人。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPoints.map((p, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{p.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 功能展示 ===== */}
      <section className="py-20 sm:py-24 dark:bg-gray-900" id="features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              九大核心功能，覆盖求职全流程
            </h2>
            <p className="text-gray-500 dark:text-gray-400">从简历制作到面试通过，AI 做你的私人求职教练</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const c = colorMap[f.color]
              return (
                <div
                  key={i}
                  onClick={() => navigate(user ? f.path : '/register')}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-transparent transition-all duration-300 cursor-pointer"
                >
                  <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${c.solidBg} text-white shadow-md`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm">
                    {f.desc}
                  </p>
                  <div className={`flex items-center ${c.actionText} dark:text-gray-300 font-medium text-sm`}>
                    {user ? f.action : '免费试用'}
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== 为什么选择我们 ===== */}
      <section className="bg-gray-50 dark:bg-gray-800/30 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              为什么选择 AI 求职助手？
            </h2>
            <p className="text-gray-500 dark:text-gray-400">专为大学生设计的求职辅助工具，更懂你的需求</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((a, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm text-center hover:shadow-md transition-shadow duration-300">
                <div className="text-3xl mb-4">{a.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{a.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 使用流程 ===== */}
      <section className="py-20 sm:py-24 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              9 步求职全流程
            </h2>
            <p className="text-gray-500 dark:text-gray-400">从简历优化到面试通关，AI 全程陪伴</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10">
            {[
              { step: '1', title: '上传简历', desc: '支持 PDF/Word 格式，AI 自动解析内容结构' },
              { step: '2', title: '简历评分', desc: 'AI 多维度评分，诊断短板并给出改进建议' },
              { step: '3', title: '简历优化', desc: 'AI 深度优化简历表达，提升关键词覆盖' },
              { step: '4', title: '人岗匹配', desc: 'AI 分析简历与目标岗位的匹配度' },
              { step: '5', title: '面试问题', desc: 'AI 根据岗位生成高频面试问题' },
              { step: '6', title: '模拟面试', desc: '基于简历生成个性化面试题，实时对话评估' },
              { step: '7', title: '求职攻略', desc: 'AI 提供求职全阶段实用建议和工具' },
              { step: '8', title: '查看报告', desc: '获取多维度评分和针对性提升建议' },
              { step: '9', title: '简历模板', desc: '5 款专业模板，一键生成精美简历' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25">
                  {s.step}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA 区域 ===== */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            准备好，拿下心仪的 Offer 了吗？
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
            免费注册，立即体验 AI 驱动的求职辅助。已有数千名同学通过我们提升了面试表现。
          </p>
          <button
            onClick={() => navigate(user ? '/interviews' : '/register')}
            className="px-8 py-3.5 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors text-base shadow-lg"
          >
            {user ? '进入面试中心 →' : '免费注册，开始使用 →'}
          </button>
        </div>
      </section>

      {/* ===== 底部 Footer ===== */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg">简历面试AI助手</span>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            © 2026 简历面试AI助手 · 山东省大学生软件设计大赛参赛作品
          </div>
        </div>
      </footer>
    </div>
  )
}
