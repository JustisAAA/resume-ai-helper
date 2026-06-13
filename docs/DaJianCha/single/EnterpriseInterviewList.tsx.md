# EnterpriseInterviewList.tsx

**文件路径**: frontend/src/pages/EnterpriseInterviewList.tsx

## 职责概述
企业面试列表页面，展示企业发起的面试记录，支持查看详情和进入面试。

## 代码质量分析

### 优点
- Interview 接口包含 user 和 resume 嵌套信息
- 使用 Pagination、StatusBadge 等通用组件
- 数据获取逻辑简洁清晰

### 问题
- feedback 字段使用 `any` 类型
- 缺少面试状态筛选功能（只看进行中/已完成）
- 没有展示面试评分汇总

### 建议
- 为 feedback 定义结构化类型
- 添加面试状态筛选标签
- 在列表项上展示面试结果摘要

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../services/api`: enterpriseAPI
- `@heroicons/react/24/outline`: ChartBarIcon 等
- `../components/Loading`
- `../components/Pagination`
- `../components/EmptyState`
- `../components/ErrorAlert`
- `../components/StatusBadge`
