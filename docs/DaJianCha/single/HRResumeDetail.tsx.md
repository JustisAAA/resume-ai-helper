# HRResumeDetail.tsx

**文件路径**: frontend/src/pages/HRResumeDetail.tsx

## 职责概述
HR 简历详情页面，查看候选人简历、AI 智能评分分析，支持通过/拒绝和邀请面试。

## 代码质量分析

### 优点
- 使用 ScoringConfigModal 组件配置评分
- 支持 AI 智能分析
- 操作按钮丰富（通过、拒绝、下载、聊天）

### 问题
- resume/application/aiAnalysis 都使用 `any` 类型
- 与 EnterpriseResumeDetail.tsx 功能高度重复

### 建议
- 与 EnterpriseResumeDetail 共享简历详情组件
- 定义 ResumeAnalysis 专用类型
- 简历文件支持在线预览

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useParams, useNavigate
- `../services/hrAPI`: hrAPI
- `../components/ScoringConfigModal`
- `../utils/image`: getImageUrl
- `../components/Toast`: useToast
- `../components/ThemeToggle`
- `../components/Loading`
- `../components/ErrorAlert`
- `@heroicons/react/24/outline`: ArrowLeftIcon, DocumentTextIcon 等
