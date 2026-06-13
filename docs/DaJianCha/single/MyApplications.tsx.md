# MyApplications.tsx

**文件路径**: frontend/src/pages/MyApplications.tsx

## 职责概述
我的投递管理页面，展示用户所有职位投递记录，含状态标签和分页。

## 代码质量分析

### 优点
- Application 接口字段完整，包含嵌套的 job/enterprise 信息和状态枚举
- 使用 StatusBadge、Pagination、Loading、EmptyState 等通用组件，组件化好
- 使用 heroicons 图标库，视觉统一

### 问题
- Application 状态枚举值为字符串联合类型，可改为枚举
- 缺少"撤回投递"操作
- 状态变化后（如企业更新状态）用户无法获知，缺少通知机制

### 建议
- 使用 TypeScript 枚举替代字符串联合类型
- 添加投递状态变更通知或邮件提醒
- 支持用户主动撤回 PENDING 状态的投递

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../utils/api`: getApiUrl
- `@heroicons/react/24/outline`: MapPinIcon, CurrencyDollarIcon, BuildingOfficeIcon
- `../components/Pagination`
- `../components/Loading`
- `../components/ErrorAlert`
- `../components/EmptyState`
- `../components/StatusBadge`
