# InterviewList.tsx

**文件路径**: frontend/src/pages/InterviewList.tsx

## 职责概述
面试列表页面，展示用户所有模拟面试记录，包括面试统计概览（总数、完成数、平均分等）和列表操作。

## 代码质量分析

### 优点
- 组件使用丰富：Loading、ErrorAlert、StatusBadge、Toast 组件组合使用，复用性好
- 统计信息清晰：顶部展示面试统计数据卡片
- 后端缺失字段在前端实时计算（如 duration 根据 startedAt/completedAt 计算）

### 问题
- useEffect 依赖数组为空 `[]`，fetchInterviews 未被包含，可能导致 stale closure
- API 返回类型使用了 `as any` 强制转换，丢失了类型安全性
- token 每次从 localStorage 获取，未统一管理

### 建议
- 使用 useCallback 包裹 fetchInterviews 并加入依赖数组
- 修复 API 返回类型的 any 转换，使用正确的泛型
- 统一 token 管理到 HTTP 拦截器

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../services/api`: interviewAPI, Interview
- `../components/Toast`: useToast
- `../components/ErrorAlert`
- `../components/Loading`
- `../components/StatusBadge`
