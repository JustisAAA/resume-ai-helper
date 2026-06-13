# JobList.tsx

**文件路径**: frontend/src/pages/JobList.tsx

## 职责概述
职位列表页面，展示所有招聘职位，支持搜索和分页浏览。

## 代码质量分析

### 优点
- Job 接口定义完整，包含企业嵌套信息和关联统计
- 使用 Pagination 分页组件，支持大列表数据
- 使用 heroicons 图标库，视觉一致性良好
- getImageUrl 工具函数处理企业 logo

### 问题
- 没有搜索过滤的 UI，搜索参数可能通过 URL query 传入
- 缺少职位类型、地点等筛选条件
- 列表项在企业 Logo 加载失败时缺少 fallback 显示

### 建议
- 添加搜索框和筛选条件（类型、地点、薪资范围）
- 添加企业 Logo 加载失败的 fallback 组件
- 考虑无限滚动或保持分页

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../services/api`: jobAPI
- `@heroicons/react/24/outline`: MapPinIcon, CurrencyDollarIcon 等
- `../utils/image`: getImageUrl
- `../components/Pagination`
- `../components/Loading`
- `../components/ErrorAlert`
- `../components/EmptyState`
