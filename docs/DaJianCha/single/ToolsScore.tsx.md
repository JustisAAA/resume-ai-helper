# ToolsScore.tsx

**文件路径**: frontend/src/pages/ToolsScore.tsx

## 职责概述
简历评分工具，支持从未分析的简历中选择并触发 AI 评分，展示多维度评分结果和分析。

## 代码质量分析

### 优点
- 分类清晰：通过 tab 切换"未评分简历"和"已评分简历"
- ScoreResult 类型定义完善（overall_score / dimension_scores / dimension_explanation）
- 与 resumeAPI 对接良好，利用了已有简历数据
- 使用 ErrorAlert、EmptyState、ButtonSpinner 等组件

### 问题
- 本地定义了 Resume 和 ScoreResult 接口，与 `../services/api` 中的可能重复
- 维度评分使用固定的维度名称（content_quality 等），扩展性有限

### 建议
- 复用 `../services/api` 中导出的类型定义
- 考虑支持自定义评分维度
- 添加评分历史趋势对比功能

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../services/api`: resumeAPI
- `../components/Loading`: ButtonSpinner
- `../components/ErrorAlert`
- `../components/EmptyState`
