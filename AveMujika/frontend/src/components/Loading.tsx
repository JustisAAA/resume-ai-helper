interface LoadingProps {
  text?: string
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
}

export default function Loading({ text = '加载中...', fullScreen = false, size = 'md' }: LoadingProps) {
  const spinner = (
    <div className={`${sizeMap[size]} border-gray-300 border-t-teal-600 rounded-full animate-spin`} />
  )

  if (fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        {spinner}
        <p className="text-gray-500 dark:text-gray-400 text-sm">{text}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      {spinner}
      <p className="text-gray-500 dark:text-gray-400 text-sm">{text}</p>
    </div>
  )
}
