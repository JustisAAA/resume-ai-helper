# ToolsGuide.tsx

**文件路径**: frontend/src/pages/ToolsGuide.tsx

## 职责概述
求职指导工具页面，提供求职攻略和行业趋势两个标签页，包含技能趋势图表（recharts）展示。

## 代码质量分析

### 优点
- 使用 Tab 切换管理（guide / trend），UI 组织清晰
- GuideResult 和 TrendResult 类型定义规范
- 使用 recharts 的 LineChart 展示技能趋势数据
- exportTextToPdf 支持导出结果

### 问题
- 文件较大（449 行），两个 Tab 的内容在同一文件中定义
- TrendResult 中的年份字段硬编码（'2024', '2025', '2026'）
- 趋势图可能导致移动端渲染问题

### 建议
- 将两个 Tab 的内容拆分为子组件
- 趋势年份数据改为动态计算
- 添加趋势图的响应式适配

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../components/Toast`: useToast
- `../utils/exportPdf`: exportTextToPdf
- `../services/api`: toolsAPI
- `../components/Loading`: ButtonSpinner
- `../components/EmptyState`
- `recharts`: LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
