# EnterpriseInterviewReport.tsx

**文件路径**: frontend/src/pages/EnterpriseInterviewReport.tsx

## 职责概述
企业端面试报告页面，展示候选人面试的详细评分和分析结果。

## 代码质量分析

### 优点
- 使用 recharts 雷达图和柱状图做可视化展示
- AnimatedScore 数字滚动动画效果提升体验
- 支持 PDF 导出（exportReportToPDF）
- 同时使用 enterpriseAPI 和 hrAPI 获取数据

### 问题
- 与 InterviewReport.tsx 存在大量相似代码（AnimatedScore、雷达图等）
- 文件较大（514 行），子组件内联定义
- 面试报告类型定义应该从 `../types/report` 导入

### 建议
- 与 InterviewReport.tsx 共享报告展示组件
- 提取 AnimatedScore 等子组件为公共组件
- 统一报告数据类型定义

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect, useRef, useMemo
- `react-router-dom`: useParams, useNavigate, useLocation
- `../services/api`: enterpriseAPI
- `../services/hrAPI`: hrAPI
- `../utils/api`: getApiBaseUrl
- `../utils/exportPdf`: exportReportToPDF
- `../components/Toast`: useToast
- `recharts`: RadarChart, BarChart 等
- `../components/Loading`
- `../components/ErrorAlert`
- `@heroicons/react/24/outline`: 多种图标
