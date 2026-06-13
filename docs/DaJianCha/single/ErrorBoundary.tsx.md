# ErrorBoundary.tsx

**文件路径**: frontend/src/components/ErrorBoundary.tsx

## 职责概述
React 错误边界组件，捕获子组件渲染错误并展示 fallback UI。

## 代码质量分析

### 优点
- 正确实现了 getDerivedStateFromError 和 componentDidCatch
- 支持自定义 fallback
- Props/State 接口定义清晰

### 问题
- 未使用 React.ErrorInfo 类型标注 componentDidCatch 参数

## 依赖关系
- 在 App 根组件中使用
