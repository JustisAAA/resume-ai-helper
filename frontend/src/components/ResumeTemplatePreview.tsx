import React from 'react'

interface ResumeTemplatePreviewProps {
  category: 'minimal' | 'modern' | 'business' | 'creative' | 'simple'
}

// 5 个模板的迷你预览组件 —— 用 CSS 模拟真实模板样式
export default function ResumeTemplatePreview({ category }: ResumeTemplatePreviewProps) {
  // 通用示例数据
  const sampleText = ['██████████████████', '████████████', '████████████████████']

  if (category === 'minimal') {
    // 简约经典：黑灰调，左对齐，多行文本
    return (
      <div className="w-full h-full bg-white p-3 flex flex-col">
        {/* 顶部黑色横条 */}
        <div className="h-1 bg-gray-700 rounded mb-2 w-1/3" />
        {/* 个人信息区 */}
        <div className="space-y-1 mb-2">
          <div className="h-1.5 bg-gray-800 rounded w-2/3" />
          <div className="h-1 bg-gray-400 rounded w-1/2" />
        </div>
        {/* 分隔线 */}
        <div className="border-t border-gray-300 my-1" />
        {/* 工作经历段落 */}
        {sampleText.map((t, i) => (
          <div key={i} className="space-y-0.5">
            <div className="h-1 bg-gray-700 rounded w-1/3" />
            <div className="h-1 bg-gray-300 rounded w-full" />
            <div className="h-1 bg-gray-300 rounded w-5/6" />
          </div>
        ))}
        {/* 技能标签 */}
        <div className="flex gap-1 mt-auto pt-2">
          {['□□', '□□', '□□'].map((s, i) => (
            <span key={i} className="text-[8px] px-1.5 py-0.5 border border-gray-400 text-gray-600 rounded">
              {s}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (category === 'modern') {
    // 现代时尚：蓝紫渐变，左侧色条
    return (
      <div className="w-full h-full bg-white flex">
        {/* 左侧彩色条 */}
        <div className="w-2 bg-gradient-to-b from-blue-500 to-cyan-500 flex-shrink-0" />
        {/* 右侧内容 */}
        <div className="flex-1 p-3 flex flex-col">
          {/* 头像圆 + 标题 */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded w-3/4" />
              <div className="h-1 bg-blue-300 rounded w-1/2" />
            </div>
          </div>
          {/* 时间线条 */}
          <div className="space-y-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <div className="h-1 bg-blue-700 rounded w-1/3" />
                  <div className="h-0.5 bg-blue-300 rounded w-full" />
                  <div className="h-0.5 bg-blue-300 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (category === 'business') {
    // 商务专业：深紫，居中标题，分栏
    return (
      <div className="w-full h-full bg-white p-3 flex flex-col">
        {/* 顶部紫色横条 */}
        <div className="h-2 bg-gradient-to-r from-indigo-700 to-purple-700 rounded mb-2" />
        {/* 居中标题 */}
        <div className="text-center mb-2 space-y-1">
          <div className="h-2 bg-indigo-900 rounded w-2/3 mx-auto" />
          <div className="h-1 bg-indigo-500 rounded w-1/3 mx-auto" />
        </div>
        {/* 分隔线 */}
        <div className="border-t-2 border-indigo-600 my-1.5" />
        {/* 双栏内容 */}
        <div className="grid grid-cols-2 gap-2 flex-1">
          <div className="space-y-1">
            <div className="h-1.5 bg-indigo-800 rounded w-3/4" />
            <div className="h-1 bg-indigo-300 rounded w-full" />
            <div className="h-1 bg-indigo-300 rounded w-5/6" />
          </div>
          <div className="space-y-1">
            <div className="h-1.5 bg-indigo-800 rounded w-3/4" />
            <div className="h-1 bg-indigo-300 rounded w-full" />
            <div className="h-1 bg-indigo-300 rounded w-4/5" />
          </div>
        </div>
        {/* 底部进度条 */}
        <div className="mt-auto space-y-1">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="h-1 bg-indigo-700 rounded w-1/4" />
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (category === 'creative') {
    // 创意个性：粉红色块，圆角，标签感
    return (
      <div className="w-full h-full bg-gradient-to-br from-pink-50 to-rose-50 p-3 flex flex-col">
        {/* 大色块头像 */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-md flex-shrink-0" />
          <div className="flex-1">
            <div className="h-2 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full w-3/4" />
          </div>
        </div>
        {/* 标签云 */}
        <div className="flex flex-wrap gap-1 mb-2">
          {['前端', '设计', '创意', '产品'].map((s, i) => (
            <span key={i} className="text-[8px] px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium">
              {s}
            </span>
          ))}
        </div>
        {/* 内容卡 */}
        <div className="bg-white rounded-xl p-2 shadow-sm space-y-1.5 flex-1">
          <div className="h-1.5 bg-pink-700 rounded w-1/2" />
          <div className="h-1 bg-pink-300 rounded w-full" />
          <div className="h-1 bg-pink-300 rounded w-4/5" />
          <div className="border-t border-pink-100 my-1" />
          <div className="h-1.5 bg-pink-700 rounded w-1/2" />
          <div className="h-1 bg-pink-300 rounded w-full" />
        </div>
      </div>
    )
  }

  // simple（极简清新）：单色纯净，最少装饰
  return (
    <div className="w-full h-full bg-white p-4 flex flex-col items-center">
      {/* 居中标题 */}
      <div className="space-y-1 mb-3 w-full">
        <div className="h-2 bg-violet-700 rounded w-1/2 mx-auto" />
        <div className="h-0.5 bg-violet-300 rounded w-1/3 mx-auto" />
      </div>
      {/* 细线分隔 */}
      <div className="w-8 h-px bg-violet-400 mb-2" />
      {/* 居中段落 */}
      <div className="space-y-1 w-full">
        <div className="h-1 bg-violet-200 rounded w-full mx-auto" />
        <div className="h-1 bg-violet-200 rounded w-5/6 mx-auto" />
        <div className="h-1 bg-violet-200 rounded w-3/4 mx-auto" />
      </div>
      <div className="space-y-1 w-full mt-1">
        <div className="h-1 bg-violet-200 rounded w-2/3 mx-auto" />
        <div className="h-1 bg-violet-200 rounded w-3/4 mx-auto" />
      </div>
      {/* 圆点装饰 */}
      <div className="flex gap-1 mt-auto pt-2">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
        <span className="w-1.5 h-1.5 rounded-full bg-violet-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-violet-200" />
      </div>
    </div>
  )
}