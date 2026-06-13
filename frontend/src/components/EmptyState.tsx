import { ReactNode } from 'react'

interface EmptyStateProps {
  /** 自定义图标（若未提供，显示默认收件箱图标） */
  icon?: ReactNode
  /** 空状态标题 */
  title: string
  /** 描述文本 */
  description?: string
  /** 操作按钮 */
  action?: {
    label: string
    onClick: () => void
  }
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: { iconWrapper: 'w-10 h-10', titleSize: 'text-base', padding: 'py-8' },
  md: { iconWrapper: 'w-14 h-14', titleSize: 'text-lg', padding: 'py-12' },
  lg: { iconWrapper: 'w-20 h-20', titleSize: 'text-xl', padding: 'py-16' },
}

export default function EmptyState({ icon, title, description, action, size = 'md', className = '' }: EmptyStateProps) {
  const s = sizeStyles[size]

  return (
    <div className={`flex flex-col items-center justify-center ${s.padding} px-4 text-center ${className}`}>
      {icon ? (
        <div className={`${s.iconWrapper} mb-4 text-gray-300 dark:text-gray-600`}>
          {icon}
        </div>
      ) : (
        <div className={`${s.iconWrapper} mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className={`${s.titleSize} font-semibold text-gray-900 dark:text-white mb-2`}>{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md active:scale-[0.97]"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
