# EnterpriseAnalytics.tsx

**文件路径**: frontend/src/pages/EnterpriseAnalytics.tsx

## 职责概述
企业数据分析页面，展示企业招聘相关统计图表和数据。

## 代码质量分析

### 优点
- 使用 recharts 的 BarChart 和 LineChart 进行数据可视化
- CHART_COLORS 常量管理图表颜色
- 逻辑简洁（133 行），聚焦数据展示

### 问题
- stats 使用 `any` 类型，完全丧失类型安全
- 缺少时间维度筛选（如按月份/季度查看）
- 数据为空时没有 EmptyState 展示

### 建议
- 为 stats 定义 AnalysisData 类型接口
- 添加时间范围选择器
- 添加数据导出功能（Excel/CSV）

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../services/api`: enterpriseAPI
- `recharts`: BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell
- `@heroicons/react/24/outline`: ArrowLeftIcon
- `../components/Loading`
- `../components/ErrorAlert`
