# HRInterviews.tsx

**文件路径**: frontend/src/pages/HRInterviews.tsx

## 职责概述
HR 面试管理页面，展示 HR 负责的所有面试记录。

## 代码质量分析

### 优点
- Interview 接口定义包含 user 和 resume 嵌套信息
- 使用 StatusBadge / Pagination / EmptyState 等通用组件
- 使用独立的 hrAPI

### 问题
- feedback 字段使用 `any` 类型
- 缺少面试状态筛选
- 与 EnterpriseInterviewList.tsx 功能重复

### 建议
- 为 feedback 定义类型
- 添加状态筛选功能
- 与企业面试列表共享组件

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../services/hrAPI`: hrAPI
- `../components/ErrorAlert`
- `@heroicons/react/24/outline`: ChartBarIcon 等
- `../components/Loading`
- `../components/Pagination`
- `../components/EmptyState`
- `../components/ThemeToggle`
- `../components/StatusBadge`
