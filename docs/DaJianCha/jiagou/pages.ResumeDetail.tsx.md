# pages/ResumeDetail.tsx

**文件路径**: `frontend/src/pages/ResumeDetail.tsx`

## 职责概述

简历详情展示页面，求职者端核心功能之一。展示单份简历的基本信息、AI 分析结果（含维度得分、亮点、问题、改进建议、推荐关键词）以及简历原文，支持分析和删除操作。

## 核心功能

### 1. 简历信息展示
- 标题、状态（已分析/未分析）、综合评分
- 评分颜色分级：优秀(90+)绿色/良好(80+)绿色/中等(70+)黄/及格(60+)黄/需改进红
- 最后更新时间

### 2. AI 分析结果
- **总体评价**: 文本描述
- **维度得分**: 五维度卡片网格（内容完整性、结构清晰度、关键词匹配、语言表达、数据支撑）
- **亮点**: 绿色边框卡片
- **问题**: 红色边框卡片
- **改进建议**: 蓝色边框编号列表
- **推荐关键词**: 标签式展示

### 3. 操作功能
- **AI 分析** — 调用后端分析接口，带 loading 确认弹窗
- **删除** — 确认弹窗后删除，成功后跳转列表页
- **导出 PDF** — 调用 exportPdf 工具将简历原文导出为 PDF 文件

### 4. 布局
- 粘性导航栏（返回按钮 + 标题 + 操作按钮组 + ThemeToggle）
- 半透明毛玻璃导航背景
- 信息卡片分组展示，暗色模式适配

## 外部依赖

- `react-router-dom`（useParams, useNavigate）
- `@heroicons/react`（ArrowLeftIcon）
- `../components/ThemeToggle`
- `../utils/exportPdf`（exportTextToPdf）
- `../services/api`（resumeAPI）
- `../components/Toast`（useToast）
- `../components/ErrorAlert`, `../components/Loading`

## 调用关系

- 路由路径: `/resumes/:id`
- 调用 `resumeAPI.getDetail()`、`resumeAPI.analyze()`、`resumeAPI.delete()`
- 被 `App.tsx` 中的路由配置引用
