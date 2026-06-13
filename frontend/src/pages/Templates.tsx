import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { RESUME_TEMPLATES, ResumeTemplate } from '../data/templates'


export default function Templates() {
  const navigate = useNavigate()

  const handleUseTemplate = (template: ResumeTemplate) => {
    navigate('/templates/' + template.id + '/apply')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/practice')} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="返回">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">简历模板</span>
          </div>
<ThemeToggle />

        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero 区 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">简历模板</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">选择适合你目标岗位的简历模板，快速创建专业简历</p>
        </div>

        {/* 模板网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {RESUME_TEMPLATES.map((template) => (
            <div key={template.id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-lg hover:border-violet-200 transition-all duration-300">
              {/* 预览区 */}
              <div className={`relative h-64 bg-gradient-to-br ${template.bgGradient} flex items-center justify-center overflow-hidden`}>
                {/* 模拟简历预览 */}
                <div className="w-3/4 h-5/6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-2 transform group-hover:scale-105 transition-transform duration-300">
                  {/* 头部色块 */}
                  <div className={`h-3 rounded-full bg-gradient-to-r ${template.color} w-2/3`} />
                  {/* 模拟文本行 */}
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800" />
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800" />
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                  </div>
                </div>
                {/* 悬浮遮罩 + 按钮 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 text-violet-600 rounded-lg font-medium text-sm shadow-lg hover:bg-violet-50 transition-colors duration-200"
                  >
                    预览模板
                  </button>
                </div>
              </div>

              {/* 信息区 */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{template.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r ${template.color} text-white`}>
                    {template.category === 'minimal' ? '经典' : template.category === 'modern' ? '现代' : template.category === 'business' ? '商务' : template.category === 'creative' ? '创意' : '极简'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{template.description}</p>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${template.color} text-white font-medium text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300`}
                >
                  使用此模板
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
