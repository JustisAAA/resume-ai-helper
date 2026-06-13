# HRApplications.tsx

**文件路径**: frontend/src/pages/HRApplications.tsx

## 职责概述
HR 投递管理页面，管理候选人投递，支持审核、邀请面试等操作。

## 代码质量分析

### 优点
- 使用 InterviewConfigModal 发起面试配置
- 支持状态更新和分页
- 使用 heroicons 图标

### 问题
- applications 和 interviewApp 使用 `any[]` 和 `any` 类型
- 分页状态管理分散（page/totalPages/total）

### 建议
- 为 Application 定义类型接口
- 封装分页逻辑为自定义 Hook
- 添加批量操作功能

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../services/hrAPI`: hrAPI
- `../components/ErrorAlert`
- `../utils/image`: getImageUrl
- `../components/Toast`: useToast
- `../components/ThemeToggle`
- `../components/InterviewConfigModal`
- `../components/Pagination`
- `../components/Loading`
- `@heroicons/react/24/outline`: EyeIcon, CheckCircleIcon 等
- `../components/EmptyState`
