export interface ResumeTemplate {
  id: string
  name: string
  description: string
  thumbnail: string // 预览图URL或占位符
  category: 'minimal' | 'modern' | 'business' | 'creative' | 'simple'
  color: string // 主题色
  bgGradient: string // 预览背景渐变
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'minimal',
    name: '简约经典',
    description: '简洁大方，适合传统行业和国企投递',
    thumbnail: 'minimal',
    category: 'minimal',
    color: 'from-gray-600 to-gray-800',
    bgGradient: 'from-gray-100 to-gray-200'
  },
  {
    id: 'modern',
    name: '现代时尚',
    description: '设计感强，适合互联网和创意行业',
    thumbnail: 'modern',
    category: 'modern',
    color: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-100'
  },
  {
    id: 'business',
    name: '商务专业',
    description: '商务风格，适合金融、咨询等行业',
    thumbnail: 'business',
    category: 'business',
    color: 'from-indigo-600 to-purple-600',
    bgGradient: 'from-indigo-50 to-purple-100'
  },
  {
    id: 'creative',
    name: '创意个性',
    description: '个性鲜明，适合设计、广告、传媒行业',
    thumbnail: 'creative',
    category: 'creative',
    color: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-50 to-rose-100'
  },
  {
    id: 'simple',
    name: '极简清新',
    description: '极简风格，适合应届生和管培生申请',
    thumbnail: 'simple',
    category: 'simple',
    color: 'from-brand-500 to-brand-500',
    bgGradient: 'from-brand-50 to-brand-100'
  }
]
