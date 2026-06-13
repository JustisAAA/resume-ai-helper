# context/ThemeContext.tsx

**文件路径**: `frontend/src/context/ThemeContext.tsx`

## 职责概述

React Context 主题管理模块，提供全局暗黑/亮色主题切换能力。通过 localStorage 持久化用户偏好，在根组件层级注入，所有子组件通过 `useTheme()` Hook 访问主题状态。

## 核心功能

### 1. 主题状态管理
- `dark: boolean` — 是否为暗色模式
- 初始化时从 `localStorage.getItem('theme')` 读取上次选择

### 2. 主题应用
- 调用 `useEffect` 监听 `dark` 变化
- 切换 `document.documentElement.classList` 中的 `dark` 类名
- 同步写入 `localStorage`（`'dark'` 或 `'light'`）

### 3. ThemeProvider 组件
- 包裹应用根节点
- 通过 Context 向下传递 `{ dark, toggleTheme }`

### 4. useTheme Hook
- 在子组件中便捷获取主题状态和方法
- 在 Provider 外使用时抛出错误提示

## 外部依赖

- `react`（createContext, useContext, useEffect, useState）
- 无第三方 UI 库依赖

## 调用关系

- 在 `main.tsx` 或 `App.tsx` 中被引用，包裹整套组件树
- 所有需要切换主题的组件通过 `useTheme()` 消费
- 与 `ThemeToggle.tsx` 组件配合实现 UI 切换按钮
