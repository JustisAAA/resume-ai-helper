interface LoadingProps {
  text?: string
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** 动画风格: spinner(默认) | dots(弹跳点) | pulse(呼吸光晕) */
  variant?: 'spinner' | 'dots' | 'pulse'
  className?: string
}

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
}

const circleSizeMap = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

function Dots({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const s = circleSizeMap[size]
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${s} rounded-full bg-brand-600 dark:bg-brand-400 animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  )
}

function Pulse({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const s = sizeMap[size]
  return (
    <div className="relative flex items-center justify-center">
      <div className={`${s} rounded-full border-2 border-brand-600/30 dark:border-brand-400/30 animate-ping absolute inset-0`} />
      <div className={`${s} rounded-full bg-brand-600/80 dark:bg-brand-400/80 animate-pulse`} />
    </div>
  )
}

/** 按钮内联加载 spinner，用于替换内联 <svg> spinner */
export function ButtonSpinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function Loading({ text = '加载中...', fullScreen = false, size = 'md', variant = 'spinner', className = '' }: LoadingProps) {
  const spinner = variant === 'dots'
    ? <Dots size={size} />
    : variant === 'pulse'
    ? <Pulse size={size} />
    : <div className={`${sizeMap[size]} border-gray-300 dark:border-gray-600 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin`} />

  if (fullScreen) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[50vh] gap-4 ${className}`}>
        {spinner}
        {text && <p className="text-gray-500 dark:text-gray-400 text-sm">{text}</p>}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 ${className}`}>
      {spinner}
      {text && <p className="text-gray-500 dark:text-gray-400 text-sm">{text}</p>}
    </div>
  )
}
