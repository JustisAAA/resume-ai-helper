# EnterpriseResumeDetail.tsx

**文件路径**: frontend/src/pages/EnterpriseResumeDetail.tsx

## 职责概述
企业端简历详情页面，查看候选人简历、AI 智能评分分析和面试邀请操作。

## 代码质量分析

### 优点
- 使用 ScoringConfigModal 配置评分参数
- 支持 AI 智能分析（aiAnalyzing/aiAnalysis）
- 使用 StatusBadge 展示状态
- 功能丰富：查看简历、AI 评分、通过/拒绝、发起聊天

### 问题
- resume/application/aiAnalysis 都使用 `any` 类型
- 文件较大（403 行），多种功能混合
- AI 分析结果展示缺少结构化的类型定义

### 建议
- 为 Resume、Application、AIAnalysis 定义专用类型
- 将 AI 分析模块和操作按钮拆分为子组件
- 简历内容支持在线预览而非仅展示文件链接

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useParams, useNavigate
- `../services/api`: enterpriseAPI
- `../components/ScoringConfigModal`
- `../components/Toast`: useToast
- `@heroicons/react/24/outline`: 多种图标
- `../components/Loading`
- `../components/ErrorAlert`
- `../components/StatusBadge`
