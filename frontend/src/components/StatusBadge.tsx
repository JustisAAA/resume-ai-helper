interface StatusBadgeProps {
  status: string
  type?: 'application' | 'interview' | 'job' | 'resume' | 'default'
  className?: string
}

/** 面试状态配置 */
const INTERVIEW_STATUS: Record<string, { label: string; className: string }> = {
  CREATED:     { label: '未开始',    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  IN_PROGRESS: { label: '进行中',    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  COMPLETED:   { label: '已完成',    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
}

/** 职位状态配置 */
const JOB_STATUS: Record<string, { label: string; className: string }> = {
  ACTIVE:  { label: '招聘中',  className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  CLOSED:  { label: '已关闭',  className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  DRAFT:   { label: '草稿',    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
}

/** 申请状态配置 */
const APPLICATION_STATUS: Record<string, { label: string; className: string }> = {
  PENDING:    { label: '待筛选',  className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  REVIEWING:  { label: '审核中',  className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  ACCEPTED:   { label: '已通过',  className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  REJECTED:   { label: '未通过',  className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
}

/** 简历状态配置 */
const RESUME_STATUS: Record<string, { label: string; className: string }> = {
  DRAFT:    { label: '草稿',    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  ANALYZED: { label: '已分析',  className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
}

function getStatusConfig(status: string, type: string): { label: string; className: string } {
  const configs: Record<string, Record<string, { label: string; className: string }>> = {
    interview: INTERVIEW_STATUS,
    job: JOB_STATUS,
    application: APPLICATION_STATUS,
    resume: RESUME_STATUS,
  }

  const config = configs[type]
  if (config && config[status]) return config[status]
  return { label: status, className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
}

export default function StatusBadge({ status, type = 'default', className = '' }: StatusBadgeProps) {
  const config = type === 'default'
    ? { label: status, className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
    : getStatusConfig(status, type)

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  )
}
