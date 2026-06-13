interface ErrorAlertProps {
  message: string
  onRetry?: () => void
  onClose?: () => void
}

export default function ErrorAlert({ message, onRetry, onClose }: ErrorAlertProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* 错误图标 */}
      <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      {/* 错误标题 */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        出错了
      </h3>

      {/* 错误信息 */}
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mb-6">
        {message}
      </p>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重试
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
          >
            关闭
          </button>
        )}
      </div>
    </div>
  )
}
