# AIInterviewerAvatar.tsx

**文件路径**: frontend/src/components/AIInterviewerAvatar.tsx

## 职责概述
AI 面试官虚拟形象组件，根据面试状态（idle/listening/thinking/speaking/ended）展示不同的动画效果和状态文本。

## 代码质量分析

### 优点
- 类型定义清晰：AvatarState 为联合类型，Props 接口精确定义
- 使用枚举状态管理不同阶段的显示效果
- CSS 动画丰富，展示效果佳

### 问题
- 文件较大（168 行），SVG 动画细节较多
- 缺少无障碍（aria）标签

### 建议
- 添加 aria-label 提升可访问性
- 考虑提取动画部分为独立样式

## 依赖关系
- 被多个面试页面导入（InterviewRoom, EnterpriseInterviewRoom 等）
- 仅依赖 React 类型
