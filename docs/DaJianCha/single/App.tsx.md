# App.tsx

**文件路径**: frontend/src/App.tsx

## 职责概述
应用的**根路由组件**，集中管理所有前端页面的路由配置，实现四种角色（普通用户/管理员/企业/HR）的路由守卫逻辑，并根据用户角色动态设置主题 data-role 属性。

## 代码质量分析
- 优点：
  - 采用 `React.lazy` + `Suspense` 实现代码分割，减少首屏加载体积
  - 路由守卫逻辑清晰，四种守卫（UserRoute/AdminRoute/EnterpriseRoute/HRRoute）职责分明
  - 通过 `localStorage` 监听跨标签页登录/登出事件，提升多标签体验
  - 角色主题切换通过 `document.documentElement.dataset.role` 实现，轻量高效
- 问题：
  - 所有 50+ 页面组件一次性 lazy import，虽然不影响加载但影响可读性
  - `getUser()` 函数每次调用都 `JSON.parse`，缺少缓存机制
  - HR 路由守卫中 token 验证逻辑仅检查 localStorage，无后端校验
  - 管理员角色回退到企业端主题（`role = 'enterprise'`），没有独立主题变量
- 建议：
  - 可将路由配置提取为独立的路由表配置文件
  - 考虑使用 `zustand` 或 `react-query` 管理用户状态，替代 localStorage 直接操作

## 依赖关系
- 导入此文件的文件：
  - frontend/src/main.tsx
- 此文件导入的模块：
  - react, react-router-dom
  - components/Loading
  - pages/ 下所有页面组件（通过 lazy import）
