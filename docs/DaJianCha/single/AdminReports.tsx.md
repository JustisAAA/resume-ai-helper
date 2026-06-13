# AdminReports.tsx

**文件路径**: frontend/src/pages/AdminReports.tsx

## 职责概述
管理员投诉管理页面，展示用户投诉列表，支持审核（批准/拒绝）处理。

## 代码质量分析

### 优点
- Complaint 接口定义完整（reporter/target/reason/status 等）
- 使用独立的 reportAPI 服务
- 使用 Pagination、Toast、ErrorAlert、EmptyState 等通用组件

### 问题
- 投诉详情展示不够详细（缺少对话记录查看）
- 缺少投诉处理日志
- 没有投诉统计（各类投诉数量）

### 建议
- 添加投诉详细内容弹窗
- 记录投诉处理操作日志
- 展示投诉类型分布统计

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `../components/AdminLayout`
- `../services/reportAPI`: reportAPI
- `../components/Toast`: useToast
- `../components/ErrorAlert`
- `../components/Pagination`
- `../components/Loading`
- `../components/EmptyState`
