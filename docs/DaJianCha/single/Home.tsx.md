# Home.tsx

**文件路径**: frontend/src/pages/Home.tsx

## 职责概述
系统的首页/落地页组件，负责展示产品品牌形象、核心功能入口和角色选择引导，是新用户进入系统的第一个页面。

## 代码质量分析

### 优点
- 视觉效果丰富：使用动态渐变背景（HeroBg）、CSS 动画（blob/fadeInUp/float）和光斑效果，UI 体验佳
- 暗黑模式适配完善：所有颜色均提供了 dark: 变体
- 组件拆分清晰：将背景动画（HeroBg）和角色卡片（RoleCard）拆分为内部组件，职责分明
- 响应式布局：使用了 max-w-7xl、grid 自适应等布局策略

### 问题
- 内联 CSS 动画代码（floatingAnimation）通过 `<style>` 标签注入，不利于样式管理
- RoleCard 组件的 props 类型未使用 interface 定义，类型安全性较弱
- 所有 JSX 图标直接内联，无法复用，增加了文件体积

### 建议
- 将动画样式移至全局 CSS 文件中管理
- 提取可复用的 SVG 图标为独立组件或使用 Icon 库
- 为 RoleCard 等内部组件定义明确的 Props 接口

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用，无直接导入)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`: 主题切换组件
