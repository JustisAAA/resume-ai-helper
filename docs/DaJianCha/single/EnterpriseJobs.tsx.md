# EnterpriseJobs.tsx

**文件路径**: frontend/src/pages/EnterpriseJobs.tsx

## 职责概述
企业职位管理页面，企业用户可以查看、编辑、删除已发布的职位。

## 代码质量分析

### 优点
- 使用 StatusBadge 展示职位状态
- 支持编辑（PencilIcon）和删除（TrashIcon）操作
- Toast 反馈操作结果

### 问题
- jobs 状态使用 `any[]`，类型安全差
- 删除操作没有二次确认弹窗，直接删除风险高
- useEffect 依赖数组为空，潜在 stale closure 问题

### 建议
- 为 Job 定义专用接口
- 删除前使用 Modal 确认而非原生 confirm
- 使用 useCallback 重构数据加载

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../services/api`: jobAPI, enterpriseAPI
- `../components/Toast`: useToast
- `../components/Loading`
- `../components/EmptyState`
- `../components/ErrorAlert`
- `../components/StatusBadge`
- `@heroicons/react/24/outline`: PencilIcon, TrashIcon, ChatBubbleLeftEllipsisIcon
