# EnterpriseApplications.tsx

**文件路径**: frontend/src/pages/EnterpriseApplications.tsx

## 职责概述
企业投递管理页面，展示企业收到的所有职位投递，支持筛选、状态变更和邀请面试。

## 代码质量分析

### 优点
- 使用 InterviewConfigModal 组件管理面试配置，职责分离
- 丰富的 heroicons 图标集合
- Job 接口定义清晰
- 支持多种操作（查看简历、通过/拒绝、邀请面试、发起聊天）

### 问题
- 文件较大（522 行），功能太多导致单一文件膨胀
- 未使用 `any[]` 但部分变量类型仍不够精确
- 投递列表和操作栏高度耦合

### 建议
- 将投递卡片/操作按钮拆分为独立子组件
- 添加投递状态的批量操作功能
- 考虑使用数据表组件替代自定义列表

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../services/api`: enterpriseAPI, jobAPI
- `../utils/api`: getApiBaseUrl
- `../utils/image`: getImageUrl
- `../components/Toast`: useToast
- `../components/InterviewConfigModal`: InterviewConfig, InterviewConfigModal
- `../components/Pagination`
- `../components/Loading`
- `../components/EmptyState`
- `../components/ErrorAlert`
- `../components/StatusBadge`
- `@heroicons/react/24/outline`: 多种图标
