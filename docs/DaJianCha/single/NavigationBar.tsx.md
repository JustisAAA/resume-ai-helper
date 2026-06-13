# NavigationBar.tsx

**文件路径**: frontend/src/components/NavigationBar.tsx

## 职责概述
通用导航栏组件，支持标题、返回按钮、右侧操作区域和主题切换。

## 代码质量分析

### 优点
- Props 接口设计完善（title/backPath/rightContent/showThemeToggle/userName/navItems）
- 支持两种模式：简洁模式和完整导航模式
- 统一了各页面的导航样式

## 依赖关系
- 被 PageLayout 和多个页面导入使用
