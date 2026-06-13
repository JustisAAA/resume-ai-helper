# JobSeekerHome.tsx

**文件路径**: frontend/src/pages/JobSeekerHome.tsx

## 职责概述
求职者功能主页，展示 AI 简历分析、模拟面试等九大核心功能入口卡片，并包含动画样式和统计信息区域。

## 代码质量分析

### 优点
- 功能入口配置化：使用 features 数组统一管理九大功能模块的图标、标题、描述和跳转路径
- 动画效果丰富：自定义 blob/fadeInUp/float/scaleIn 等 CSS 动画提升视觉体验
- 响应式设计完善：使用 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 等自适应布局

### 问题
- 文件体积较大（579 行），所有 SVG 图标均为内联 JSX，导致代码臃肿且无法复用
- CSS 动画代码通过反引号字符串内联在 JS 中（`floatingAnimation`），违背关注点分离原则
- features 数组中的图标直接返回 JSX 字面量，无类型约束

### 建议
- 将 SVG 图标提取为独立组件文件或使用图标库
- 将动画样式移至全局 CSS 文件
- 考虑将大段 JSX 拆分为子组件

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`: 主题切换组件
