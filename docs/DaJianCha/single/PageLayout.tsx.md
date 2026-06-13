# PageLayout.tsx

**文件路径**: frontend/src/components/PageLayout.tsx

## 职责概述
通用页面布局组件，包裹 NavigationBar 和内容区域，统一页面结构。

## 代码质量分析

### 优点
- 支持自定义最大宽度（maxWidth）和背景色
- 将 NavigationBar 的参数透传
- 设计简洁，职责单一

## 依赖关系
- 可被多个页面使用（但实际页面未广泛使用，多直接写导航栏）
