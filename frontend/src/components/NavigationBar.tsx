import { ReactNode } from 'react'
import ThemeToggle from './ThemeToggle'

interface NavItem {
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
}

interface NavigationBarProps {
  /** 页面标题（左侧显示） */
  title: string
  /** 返回路径（设置后显示返回箭头） */
  backPath?: string | (() => void)
  /** 右侧操作区域（按钮、链接等） */
  rightContent?: ReactNode
  /** 显示主题切换按钮 */
  showThemeToggle?: boolean
  /** 是否显示用户名（完整导航模式） */
  userName?: string
  /** 导航链接列表（完整导航模式） */
  navItems?: NavItem[]
  /** 退出登录回调 */
  onLogout?: () => void
  /** 自定义 Logo 内容 */
  logoContent?: ReactNode
  className?: string
}

export default function NavigationBar({
  title,
  backPath,
  rightContent,
  showThemeToggle = true,
  userName,
  navItems,
  onLogout,
  logoContent,
  className = '',
}: NavigationBarProps) {
  const handleBack = () => {
    if (typeof backPath === 'function') {
      backPath()
    } else if (typeof backPath === 'string') {
      // navigate will be available via window.location or we could accept a navigate prop
      // but we'll use a simple approach
      window.history.back()
    }
  }

  const rightArea = (
    <div className="flex items-center gap-2">
      {rightContent}
      {showThemeToggle && <ThemeToggle />}
    </div>
  )

  // Full navigation mode (with nav links, user name, logout)
  if (navItems || userName) {
    return (
      <nav className={`sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo + Nav Items */}
            <div className="flex items-center space-x-6">
              {logoContent || (
                <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-600 bg-clip-text text-transparent">
                  MyGo
                </span>
              )}
              {navItems && navItems.length > 0 && (
                <div className="hidden md:flex items-center space-x-2">
                  {navItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={item.onClick}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        item.active
                          ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: User + Theme + Logout */}
            <div className="flex items-center gap-3">
              {userName && (
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                  {userName}
                </span>
              )}
              {rightArea}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  退出
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Back navigation mode (back arrow + title + right content)
  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            {backPath && (
              <button
                onClick={handleBack}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="返回"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          </div>
          {rightArea}
        </div>
      </div>
    </nav>
  )
}
