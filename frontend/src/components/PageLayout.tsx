import { ReactNode } from 'react'
import NavigationBar from './NavigationBar'

interface PageLayoutProps {
  children: ReactNode
  /** 页面标题（传给 NavigationBar） */
  title?: string
  /** 返回路径 */
  backPath?: string | (() => void)
  /** 导航栏右侧内容 */
  navRightContent?: ReactNode
  /** 是否显示主题切换 */
  showThemeToggle?: boolean
  /** 最大宽度 */
  maxWidth?: '7xl' | '6xl' | '5xl' | '4xl' | 'sm'
  /** 背景色类名 */
  bgClass?: string
  /** 导航栏用户名（完整模式） */
  userName?: string
  /** 导航链接 */
  navItems?: { label: string; onClick?: () => void; active?: boolean }[]
  /** 退出登录回调 */
  onLogout?: () => void
  /** 是否使用居中布局（登录页） */
  centered?: boolean
  className?: string
}

const maxWidthMap = {
  '7xl': 'max-w-7xl',
  '6xl': 'max-w-6xl',
  '5xl': 'max-w-5xl',
  '4xl': 'max-w-4xl',
  'sm': 'max-w-sm',
}

export default function PageLayout({
  children,
  title,
  backPath,
  navRightContent,
  showThemeToggle = true,
  maxWidth = '7xl',
  bgClass = 'bg-gray-50 dark:bg-gray-900',
  userName,
  navItems,
  onLogout,
  centered = false,
  className = '',
}: PageLayoutProps) {
  const mw = maxWidthMap[maxWidth]

  return (
    <div className={`min-h-screen ${bgClass} ${className}`}>
      {title && (
        <NavigationBar
          title={title}
          backPath={backPath}
          rightContent={navRightContent}
          showThemeToggle={showThemeToggle}
          userName={userName}
          navItems={navItems}
          onLogout={onLogout}
        />
      )}
      <main className={centered ? 'flex items-center justify-center min-h-[calc(100vh-4rem)]' : ''}>
        {centered ? (
          <div className={`w-full px-4 py-8 ${mw} mx-auto`}>
            {children}
          </div>
        ) : (
          <div className={`${mw} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
            {children}
          </div>
        )}
      </main>
    </div>
  )
}
