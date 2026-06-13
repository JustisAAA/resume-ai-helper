# AdminDashboard.tsx

**文件路径**: frontend/src/pages/AdminDashboard.tsx

## 职责概述
管理员仪表盘页面，展示平台统计数据总览（用户数、企业数、投诉数等）。

## 代码质量分析

### 优点
- 使用 AdminLayout 组件统一后台布局
- 从 adminAPI 导入 AdminStats 类型，类型安全
- 内联 SVG 图标组件命名清晰

### 问题
- 内联 SVG 图标与 AdminUsers 等页面重复定义
- 统计卡片未拆分组件，可能导致重复代码
- 缺少时间范围筛选

### 建议
- 提取内联 SVG 图标为公共组件
- 将统计卡片拆分为 StatCard 组件
- 添加数据时间范围筛选功能

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState
- `react-router-dom`: useNavigate
- `../components/AdminLayout`
- `../services/api`: adminAPI, AdminStats
- `../components/ErrorAlert`
